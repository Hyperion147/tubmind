import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { ideaReactions, ideas } from "@/db/schema";
import { getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { isIdeaLive } from "@/lib/ideas";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, isBlocked } = await getCurrentSessionAccess();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  if (isBlocked) {
    return fail("Blocked users cannot react", 403);
  }

  const [idea] = await db
    .select({
      id: ideas.id,
      ownerId: ideas.ownerId,
      visibility: ideas.visibility,
      status: ideas.status,
    })
    .from(ideas)
    .where(eq(ideas.id, id))
    .limit(1);

  if (!idea) {
    return fail("Idea not found", 404);
  }

  const canReact = isIdeaLive(idea) || idea.ownerId === session.profile.id;

  if (!canReact) {
    return fail("Reactions are disabled for this idea", 403);
  }

  const [existingReaction] = await db
    .select()
    .from(ideaReactions)
    .where(
      and(
        eq(ideaReactions.ideaId, id),
        eq(ideaReactions.userId, session.profile.id),
      ),
    )
    .limit(1);

  if (existingReaction) {
    await db
      .delete(ideaReactions)
      .where(
        and(
          eq(ideaReactions.ideaId, id),
          eq(ideaReactions.userId, session.profile.id),
        ),
      );
  } else {
    await db.insert(ideaReactions).values({
      ideaId: id,
      userId: session.profile.id,
    });
  }

  const [reactionCountResult] = await db
    .select({ value: count() })
    .from(ideaReactions)
    .where(eq(ideaReactions.ideaId, id));

  return ok({
    reacted: !existingReaction,
    count: reactionCountResult?.value ?? 0,
  });
}
