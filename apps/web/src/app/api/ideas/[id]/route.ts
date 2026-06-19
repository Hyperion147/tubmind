import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  ideaComments,
  ideaDetails,
  ideaFeatures,
  ideas,
  ideaTechStacks,
  profiles,
} from "@tubmind/database"
import { getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { getPublishedAtForState, isIdeaLive } from "@tubmind/domain";
import { updateIdeaSchema } from "@tubmind/contracts";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getIdeaAccess(id: string) {
  const { session, isBlocked } = await getCurrentSessionAccess();

  const [idea] = await db
    .select()
    .from(ideas)
    .where(eq(ideas.id, id))
    .limit(1);

  if (!idea) {
    return { session, idea: null, canView: false, canEdit: false };
  }

  const isOwner = session?.profile.id === idea.ownerId;
  const isAdmin = session?.profile.role === "admin";
  const isPublic = isIdeaLive(idea);

  return {
    session,
    isBlocked,
    idea,
    canView: Boolean(isOwner || isAdmin || isPublic),
    canEdit: Boolean(!isBlocked && (isOwner || isAdmin)),
  };
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await getIdeaAccess(id);

  if (!access.idea) {
    return fail("Idea not found", 404);
  }

  if (!access.canView) {
    return fail("Forbidden", 403);
  }

  const isOwner = access.session?.profile.id === access.idea.ownerId;
  const isAdmin = access.session?.profile.role === "admin";

  if (!isOwner && !isAdmin) {
    const [owner, details, features, techStacks, comments] = await Promise.all([
      db
        .select({
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl,
        })
        .from(profiles)
        .where(eq(profiles.id, access.idea.ownerId))
        .limit(1),
      db
        .select({
          problem: ideaDetails.problem,
          targetAudience: ideaDetails.targetAudience,
          designStyle: ideaDetails.designStyle,
          budgetRange: ideaDetails.budgetRange,
          timeline: ideaDetails.timeline,
          spaceType: ideaDetails.spaceType,
        })
        .from(ideaDetails)
        .where(eq(ideaDetails.ideaId, id))
        .limit(1),
      db
        .select({
          id: ideaFeatures.id,
          ideaId: ideaFeatures.ideaId,
          label: ideaFeatures.label,
          description: ideaFeatures.description,
          sortOrder: ideaFeatures.sortOrder,
          isCompleted: ideaFeatures.isCompleted,
          createdAt: ideaFeatures.createdAt,
        })
        .from(ideaFeatures)
        .where(eq(ideaFeatures.ideaId, id))
        .orderBy(ideaFeatures.sortOrder, ideaFeatures.createdAt),
      db
        .select({
          id: ideaTechStacks.id,
          ideaId: ideaTechStacks.ideaId,
          name: ideaTechStacks.name,
          category: ideaTechStacks.category,
          notes: ideaTechStacks.notes,
          sortOrder: ideaTechStacks.sortOrder,
        })
        .from(ideaTechStacks)
        .where(eq(ideaTechStacks.ideaId, id))
        .orderBy(ideaTechStacks.sortOrder, ideaTechStacks.name),
      db
        .select({
          id: ideaComments.id,
          body: ideaComments.body,
          status: ideaComments.status,
          parentCommentId: ideaComments.parentCommentId,
          createdAt: ideaComments.createdAt,
          updatedAt: ideaComments.updatedAt,
          authorId: profiles.id,
          authorName: profiles.displayName,
          authorAvatarUrl: profiles.avatarUrl,
        })
        .from(ideaComments)
        .innerJoin(profiles, eq(ideaComments.authorId, profiles.id))
        .where(
          and(eq(ideaComments.ideaId, id), eq(ideaComments.status, "visible"))
        )
        .orderBy(desc(ideaComments.createdAt)),
    ]);

    return ok({
      id: access.idea.id,
      ownerId: access.idea.ownerId,
      slug: access.idea.slug,
      title: access.idea.title,
      summary: access.idea.summary,
      description: access.idea.description,
      progressNotes: access.idea.progressNotes,
      status: access.idea.status,
      visibility: access.idea.visibility,
      allowComments: access.idea.allowComments,
      isFeatured: access.idea.isFeatured,
      publishedAt: access.idea.publishedAt,
      lastActivityAt: access.idea.lastActivityAt,
      createdAt: access.idea.createdAt,
      updatedAt: access.idea.updatedAt,
      owner: owner[0] ?? null,
      details: details[0] ?? null,
      features,
      techStacks,
      comments,
    });
  }

  const [owner, details, features, techStacks, comments] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, access.idea.ownerId)).limit(1),
    db.select().from(ideaDetails).where(eq(ideaDetails.ideaId, id)).limit(1),
    db
      .select()
      .from(ideaFeatures)
      .where(eq(ideaFeatures.ideaId, id))
      .orderBy(ideaFeatures.sortOrder, ideaFeatures.createdAt),
    db
      .select()
      .from(ideaTechStacks)
      .where(eq(ideaTechStacks.ideaId, id))
      .orderBy(ideaTechStacks.sortOrder, ideaTechStacks.name),
    db
      .select({
        id: ideaComments.id,
        body: ideaComments.body,
        status: ideaComments.status,
        parentCommentId: ideaComments.parentCommentId,
        createdAt: ideaComments.createdAt,
        updatedAt: ideaComments.updatedAt,
        authorId: profiles.id,
        authorName: profiles.displayName,
        authorAvatarUrl: profiles.avatarUrl,
      })
      .from(ideaComments)
      .innerJoin(profiles, eq(ideaComments.authorId, profiles.id))
      .where(
        and(eq(ideaComments.ideaId, id), eq(ideaComments.status, "visible"))
      )
      .orderBy(desc(ideaComments.createdAt)),
  ]);

  return ok({
    ...access.idea,
    owner: owner[0] ?? null,
    details: details[0] ?? null,
    features,
    techStacks,
    comments,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await getIdeaAccess(id);

  if (!access.idea) {
    return fail("Idea not found", 404);
  }

  if (access.isBlocked) {
    return fail("Blocked users cannot update ideas", 403);
  }

  if (!access.canEdit || !access.session) {
    return fail("Forbidden", 403);
  }

  const session = access.session;

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = updateIdeaSchema.safeParse(payload);

  if (!parsed.success) {
    return fail("Validation failed", 422, parsed.error.flatten());
  }

  const data = parsed.data;
  const nextStatus = data.status ?? access.idea.status;
  const nextVisibility = data.visibility ?? access.idea.visibility;
  const [existingDetails] = await db
    .select()
    .from(ideaDetails)
    .where(eq(ideaDetails.ideaId, id))
    .limit(1);

  const updatedIdea = await db.transaction(async (tx) => {
    const [idea] = await tx
      .update(ideas)
      .set({
        title: data.title ?? access.idea.title,
        summary: data.summary === undefined ? access.idea.summary : data.summary || null,
        description:
          data.description === undefined
            ? access.idea.description
            : data.description || null,
        progressNotes:
          data.progressNotes === undefined
            ? access.idea.progressNotes
            : data.progressNotes || null,
        status: nextStatus,
        visibility: nextVisibility,
        allowComments: data.allowComments ?? access.idea.allowComments,
        isFeatured:
          session.profile.role === "admin"
            ? data.isFeatured ?? access.idea.isFeatured
            : access.idea.isFeatured,
        publishedAt: getPublishedAtForState({
          status: nextStatus,
          visibility: nextVisibility,
          existingPublishedAt: access.idea.publishedAt,
        }),
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(ideas.id, id))
      .returning();

    if (data.details) {
      await tx
        .insert(ideaDetails)
        .values({
          ideaId: id,
          problem:
            data.details.problem === undefined
              ? existingDetails?.problem ?? null
              : data.details.problem || null,
          targetAudience:
            data.details.targetAudience === undefined
              ? existingDetails?.targetAudience ?? null
              : data.details.targetAudience || null,
          designStyle:
            data.details.designStyle === undefined
              ? existingDetails?.designStyle ?? null
              : data.details.designStyle || null,
          budgetRange:
            data.details.budgetRange === undefined
              ? existingDetails?.budgetRange ?? null
              : data.details.budgetRange || null,
          timeline:
            data.details.timeline === undefined
              ? existingDetails?.timeline ?? null
              : data.details.timeline || null,
          spaceType:
            data.details.spaceType === undefined
              ? existingDetails?.spaceType ?? null
              : data.details.spaceType || null,
          properties:
            data.details.properties === undefined
              ? existingDetails?.properties
              : data.details.properties,
          metadata:
            data.details.metadata === undefined
              ? existingDetails?.metadata
              : data.details.metadata,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: ideaDetails.ideaId,
          set: {
            problem:
              data.details.problem === undefined
                ? existingDetails?.problem ?? null
                : data.details.problem || null,
            targetAudience:
              data.details.targetAudience === undefined
                ? existingDetails?.targetAudience ?? null
                : data.details.targetAudience || null,
            designStyle:
              data.details.designStyle === undefined
                ? existingDetails?.designStyle ?? null
                : data.details.designStyle || null,
            budgetRange:
              data.details.budgetRange === undefined
                ? existingDetails?.budgetRange ?? null
                : data.details.budgetRange || null,
            timeline:
              data.details.timeline === undefined
                ? existingDetails?.timeline ?? null
                : data.details.timeline || null,
            spaceType:
              data.details.spaceType === undefined
                ? existingDetails?.spaceType ?? null
                : data.details.spaceType || null,
            properties:
              data.details.properties === undefined
                ? existingDetails?.properties
                : data.details.properties,
            metadata:
              data.details.metadata === undefined
                ? existingDetails?.metadata
                : data.details.metadata,
            updatedAt: new Date(),
          },
        });
    }

    if (data.features) {
      await tx.delete(ideaFeatures).where(eq(ideaFeatures.ideaId, id));

      if (data.features.length > 0) {
        await tx.insert(ideaFeatures).values(
          data.features.map((feature) => ({
            ideaId: id,
            label: feature.label,
            description: feature.description || null,
            sortOrder: feature.sortOrder,
            isCompleted: feature.isCompleted,
          }))
        );
      }
    }

    if (data.techStacks) {
      await tx.delete(ideaTechStacks).where(eq(ideaTechStacks.ideaId, id));

      if (data.techStacks.length > 0) {
        await tx.insert(ideaTechStacks).values(
          data.techStacks.map((tech) => ({
            ideaId: id,
            name: tech.name,
            category: tech.category || null,
            notes: tech.notes || null,
            sortOrder: tech.sortOrder,
          }))
        );
      }
    }

    return idea;
  });

  return ok(updatedIdea);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await getIdeaAccess(id);

  if (!access.idea) {
    return fail("Idea not found", 404);
  }

  if (access.isBlocked) {
    return fail("Blocked users cannot delete ideas", 403);
  }

  if (!access.canEdit || !access.session) {
    return fail("Forbidden", 403);
  }

  await db.delete(ideas).where(eq(ideas.id, id));

  return ok({ deleted: true, id });
}
