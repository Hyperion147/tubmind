import "server-only";

import { and, desc, eq } from "drizzle-orm";

import type {
  CreateIdeaInput,
  DeleteIdeaResult,
  IdeaMutationResult,
  UpdateIdeaInput,
} from "@tubmind/contracts/idea";
import {
  ideaComments,
  ideaDetails,
  ideaFeatures,
  ideas,
  ideaTechStacks,
  profiles,
} from "@tubmind/database";
import { getPublishedAtForState, isIdeaLive } from "@tubmind/domain";
import { db } from "@/db";
import { getCurrentSession, getCurrentSessionAccess } from "@/lib/auth";
import { slugify } from "@/lib/utils/slug";
import { ServiceError } from "@/server/service-error";

function toMutationResult(
  idea: Pick<
    typeof ideas.$inferSelect,
    "id" | "slug" | "status" | "visibility" | "updatedAt"
  >,
): IdeaMutationResult {
  return {
    id: idea.id,
    slug: idea.slug,
    status: idea.status,
    visibility: idea.visibility,
    updatedAt: idea.updatedAt.toISOString(),
  };
}

async function getIdeaAccess(id: string) {
  const { session, isBlocked } = await getCurrentSessionAccess();
  const [idea] = await db
    .select()
    .from(ideas)
    .where(eq(ideas.id, id))
    .limit(1);

  if (!idea) {
    return { session, isBlocked, idea: null, canView: false, canEdit: false };
  }

  const isOwner = session?.profile.id === idea.ownerId;
  const isAdmin = session?.profile.role === "admin";

  return {
    session,
    isBlocked,
    idea,
    canView: Boolean(isOwner || isAdmin || isIdeaLive(idea)),
    canEdit: Boolean(!isBlocked && (isOwner || isAdmin)),
  };
}

export async function listIdeas(scope: string) {
  const session = await getCurrentSession();

  if (scope === "mine") {
    if (!session) throw new ServiceError("Unauthorized", 401);

    return db
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
  }

  return db
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
}

export async function createIdea(
  data: CreateIdeaInput,
): Promise<IdeaMutationResult> {
  const { session, isBlocked } = await getCurrentSessionAccess();
  if (!session) throw new ServiceError("Unauthorized", 401);
  if (isBlocked) {
    throw new ServiceError("Blocked users cannot create ideas", 403);
  }

  const slug = `${slugify(data.title)}-${crypto.randomUUID().slice(0, 8)}`;
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
        })),
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
        })),
      );
    }

    return idea;
  });

  return toMutationResult(createdIdea);
}

export async function getIdea(id: string) {
  const access = await getIdeaAccess(id);
  if (!access.idea) throw new ServiceError("Idea not found", 404);
  if (!access.canView) throw new ServiceError("Forbidden", 403);

  const isOwner = access.session?.profile.id === access.idea.ownerId;
  const isAdmin = access.session?.profile.role === "admin";
  const restricted = !isOwner && !isAdmin;

  const [owner, details, features, techStacks, comments] = await Promise.all([
    restricted
      ? db
          .select({
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
          })
          .from(profiles)
          .where(eq(profiles.id, access.idea.ownerId))
          .limit(1)
      : db
          .select()
          .from(profiles)
          .where(eq(profiles.id, access.idea.ownerId))
          .limit(1),
    restricted
      ? db
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
          .limit(1)
      : db.select().from(ideaDetails).where(eq(ideaDetails.ideaId, id)).limit(1),
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
        and(
          eq(ideaComments.ideaId, id),
          eq(ideaComments.status, "visible"),
        ),
      )
      .orderBy(desc(ideaComments.createdAt)),
  ]);

  return {
    ...access.idea,
    owner: owner[0] ?? null,
    details: details[0] ?? null,
    features,
    techStacks,
    comments,
  };
}

export async function updateIdea(
  id: string,
  data: UpdateIdeaInput,
): Promise<IdeaMutationResult> {
  const access = await getIdeaAccess(id);
  if (!access.idea) throw new ServiceError("Idea not found", 404);
  if (access.isBlocked) {
    throw new ServiceError("Blocked users cannot update ideas", 403);
  }
  if (!access.canEdit || !access.session) {
    throw new ServiceError("Forbidden", 403);
  }
  const session = access.session;

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
        summary:
          data.summary === undefined ? access.idea.summary : data.summary || null,
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
      const detailValues = {
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
      };

      await tx
        .insert(ideaDetails)
        .values({ ideaId: id, ...detailValues })
        .onConflictDoUpdate({
          target: ideaDetails.ideaId,
          set: detailValues,
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
          })),
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
          })),
        );
      }
    }

    return idea;
  });

  return toMutationResult(updatedIdea);
}

export async function deleteIdea(id: string): Promise<DeleteIdeaResult> {
  const access = await getIdeaAccess(id);
  if (!access.idea) throw new ServiceError("Idea not found", 404);
  if (access.isBlocked) {
    throw new ServiceError("Blocked users cannot delete ideas", 403);
  }
  if (!access.canEdit || !access.session) {
    throw new ServiceError("Forbidden", 403);
  }

  await db.delete(ideas).where(eq(ideas.id, id));
  return { deleted: true, id };
}
