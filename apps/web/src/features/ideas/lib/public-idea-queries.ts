import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  ideaComments,
  ideaDetails,
  ideaFeatures,
  ideaReactions,
  ideas,
  ideaTechStacks,
  profiles,
} from "@tubmind/database";

export async function getPublicIdeaPageData(input: {
  slug: string;
  viewerId?: string;
}) {
  const [idea] = await db
    .select({
      id: ideas.id,
      ownerId: ideas.ownerId,
      slug: ideas.slug,
      title: ideas.title,
      summary: ideas.summary,
      description: ideas.description,
      progressNotes: ideas.progressNotes,
      status: ideas.status,
      visibility: ideas.visibility,
      allowComments: ideas.allowComments,
      publishedAt: ideas.publishedAt,
      ownerName: profiles.displayName,
      ownerAvatarUrl: profiles.avatarUrl,
    })
    .from(ideas)
    .innerJoin(profiles, eq(ideas.ownerId, profiles.id))
    .where(and(eq(ideas.slug, input.slug), eq(ideas.visibility, "public")))
    .limit(1);

  if (!idea) {
    return null;
  }

  const [
    details,
    features,
    techStacks,
    comments,
    reactionCountResult,
    viewerReaction,
  ] = await Promise.all([
    db.select().from(ideaDetails).where(eq(ideaDetails.ideaId, idea.id)).limit(1),
    db
      .select()
      .from(ideaFeatures)
      .where(eq(ideaFeatures.ideaId, idea.id))
      .orderBy(ideaFeatures.sortOrder, ideaFeatures.createdAt),
    db
      .select()
      .from(ideaTechStacks)
      .where(eq(ideaTechStacks.ideaId, idea.id))
      .orderBy(ideaTechStacks.sortOrder, ideaTechStacks.name),
    db
      .select({
        id: ideaComments.id,
        body: ideaComments.body,
        createdAt: ideaComments.createdAt,
        authorId: profiles.id,
        authorName: profiles.displayName,
      })
      .from(ideaComments)
      .innerJoin(profiles, eq(ideaComments.authorId, profiles.id))
      .where(
        and(
          eq(ideaComments.ideaId, idea.id),
          eq(ideaComments.status, "visible"),
        ),
      )
      .orderBy(desc(ideaComments.createdAt)),
    db
      .select({ value: count() })
      .from(ideaReactions)
      .where(eq(ideaReactions.ideaId, idea.id)),
    input.viewerId
      ? db
          .select()
          .from(ideaReactions)
          .where(
            and(
              eq(ideaReactions.ideaId, idea.id),
              eq(ideaReactions.userId, input.viewerId),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
  ]);

  return {
    idea,
    detail: details[0],
    features,
    techStacks,
    comments,
    reactionCount: reactionCountResult[0]?.value ?? 0,
    hasReacted: viewerReaction.length > 0,
  };
}
