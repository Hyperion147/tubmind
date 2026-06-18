import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { ideaDetails, ideaFeatures, ideas, ideaTechStacks, profiles } from "@/db/schema";
import { getCurrentSession, getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { getPublishedAtForState } from "@/lib/ideas";
import { slugify } from "@/lib/utils/slug";
import { createIdeaSchema } from "@/lib/validators/idea";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? "public";
  const session = await getCurrentSession();

  if (scope === "mine") {
    if (!session) {
      return fail("Unauthorized", 401);
    }

    const myIdeas = await db
      .select({
        id: ideas.id,
        slug: ideas.slug,
        title: ideas.title,
        summary: ideas.summary,
        status: ideas.status,
        visibility: ideas.visibility,
        allowComments: ideas.allowComments,
        lastActivityAt: ideas.lastActivityAt,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
      })
      .from(ideas)
      .where(eq(ideas.ownerId, session.profile.id))
      .orderBy(desc(ideas.updatedAt));

    return ok(myIdeas);
  }

  const publicIdeas = await db
    .select({
      id: ideas.id,
      slug: ideas.slug,
      title: ideas.title,
      summary: ideas.summary,
      status: ideas.status,
      visibility: ideas.visibility,
      isFeatured: ideas.isFeatured,
      publishedAt: ideas.publishedAt,
      ownerId: profiles.id,
      ownerName: profiles.displayName,
      ownerAvatarUrl: profiles.avatarUrl,
    })
    .from(ideas)
    .innerJoin(profiles, eq(ideas.ownerId, profiles.id))
    .where(eq(ideas.visibility, "public"))
    .orderBy(desc(ideas.publishedAt), desc(ideas.updatedAt));

  return ok(publicIdeas);
}

export async function POST(request: Request) {
  const { session, isBlocked } = await getCurrentSessionAccess();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  if (isBlocked) {
    return fail("Blocked users cannot create ideas", 403);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = createIdeaSchema.safeParse(payload);

  if (!parsed.success) {
    return fail("Validation failed", 422, parsed.error.flatten());
  }

  const data = parsed.data;
  const baseSlug = slugify(data.title);
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
  const publishedAt = getPublishedAtForState({
    status: data.status,
    visibility: data.visibility,
    existingPublishedAt: null,
  });

  const createdIdea = await db.transaction(async (tx) => {
    const [idea] = await tx
      .insert(ideas)
      .values({
        ownerId: session.profile.id,
        slug,
        title: data.title,
        summary: data.summary || null,
        description: data.description || null,
        progressNotes: data.progressNotes || null,
        status: data.status,
        visibility: data.visibility,
        allowComments: data.allowComments,
        isFeatured: session.profile.role === "admin" ? data.isFeatured : false,
        publishedAt,
        lastActivityAt: new Date(),
      })
      .returning();

    await tx.insert(ideaDetails).values({
      ideaId: idea.id,
      problem: data.details?.problem || null,
      targetAudience: data.details?.targetAudience || null,
      designStyle: data.details?.designStyle || null,
      budgetRange: data.details?.budgetRange || null,
      timeline: data.details?.timeline || null,
      spaceType: data.details?.spaceType || null,
      properties: data.details?.properties,
      metadata: data.details?.metadata,
    });

    if (data.features.length > 0) {
      await tx.insert(ideaFeatures).values(
        data.features.map((feature) => ({
          ideaId: idea.id,
          label: feature.label,
          description: feature.description || null,
          sortOrder: feature.sortOrder,
          isCompleted: feature.isCompleted,
        }))
      );
    }

    if (data.techStacks.length > 0) {
      await tx.insert(ideaTechStacks).values(
        data.techStacks.map((tech) => ({
          ideaId: idea.id,
          name: tech.name,
          category: tech.category || null,
          notes: tech.notes || null,
          sortOrder: tech.sortOrder,
        }))
      );
    }

    return idea;
  });

  return ok(createdIdea, { status: 201 });
}
