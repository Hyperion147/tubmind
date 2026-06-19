import "server-only";

import { and, count, eq } from "drizzle-orm";

import type { ToggleReactionResult } from "@tubmind/contracts/reaction";
import { ideaReactions, ideas } from "@tubmind/database";
import { isIdeaLive } from "@tubmind/domain";
import { db } from "@/db";
import { ServiceError } from "@/server/service-error";

export async function toggleIdeaReaction(input: {
  ideaId: string;
  userId: string;
}): Promise<ToggleReactionResult> {
  const [idea] = await db
    .select({
      id: ideas.id,
      ownerId: ideas.ownerId,
      visibility: ideas.visibility,
      status: ideas.status,
    })
    .from(ideas)
    .where(eq(ideas.id, input.ideaId))
    .limit(1);

  if (!idea) {
    throw new ServiceError("Idea not found", 404);
  }

  if (!isIdeaLive(idea) && idea.ownerId !== input.userId) {
    throw new ServiceError("Reactions are disabled for this idea", 403);
  }

  const reactionFilter = and(
    eq(ideaReactions.ideaId, input.ideaId),
    eq(ideaReactions.userId, input.userId),
  );
  const [existingReaction] = await db
    .select()
    .from(ideaReactions)
    .where(reactionFilter)
    .limit(1);

  if (existingReaction) {
    await db.delete(ideaReactions).where(reactionFilter);
  } else {
    await db.insert(ideaReactions).values({
      ideaId: input.ideaId,
      userId: input.userId,
    });
  }

  const [reactionCountResult] = await db
    .select({ value: count() })
    .from(ideaReactions)
    .where(eq(ideaReactions.ideaId, input.ideaId));

  return {
    reacted: !existingReaction,
    count: Number(reactionCountResult?.value ?? 0),
  };
}
