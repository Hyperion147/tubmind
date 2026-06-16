import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { ideaComments, ideas, profiles } from "@/db/schema";
import { getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { isIdeaLive } from "@/lib/ideas";
import { createCommentSchema } from "@/lib/validators/comment";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;

  const comments = await db
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
    .where(and(eq(ideaComments.ideaId, id), eq(ideaComments.status, "visible")))
    .orderBy(desc(ideaComments.createdAt));

  return ok(comments);
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, isBlocked } = await getCurrentSessionAccess();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  if (isBlocked) {
    return fail("Blocked users cannot comment", 403);
  }

  const [idea] = await db
    .select({
      id: ideas.id,
      ownerId: ideas.ownerId,
      slug: ideas.slug,
      allowComments: ideas.allowComments,
      status: ideas.status,
      visibility: ideas.visibility,
    })
    .from(ideas)
    .where(eq(ideas.id, id))
    .limit(1);

  if (!idea) {
    return fail("Idea not found", 404);
  }

  const canComment =
    idea.allowComments &&
    (isIdeaLive(idea) || idea.ownerId === session.profile.id);

  if (!canComment) {
    return fail("Comments are disabled for this idea", 403);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = createCommentSchema.safeParse(payload);

  if (!parsed.success) {
    return fail("Validation failed", 422, parsed.error.flatten());
  }

  const [comment] = await db
    .insert(ideaComments)
    .values({
      ideaId: id,
      authorId: session.profile.id,
      parentCommentId: parsed.data.parentCommentId,
      body: parsed.data.body,
    })
    .returning();

  revalidatePath(`/ideas/${idea.slug}`);
  revalidatePath(`/dashboard/ideas/${id}`);

  return ok(
    {
      ...comment,
      authorName: session.profile.displayName,
      authorAvatarUrl: session.profile.avatarUrl,
    },
    { status: 201 }
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, isBlocked } = await getCurrentSessionAccess();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  if (isBlocked) {
    return fail("Blocked users cannot delete comments", 403);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const commentId =
    typeof payload === "object" &&
    payload !== null &&
    "commentId" in payload &&
    typeof payload.commentId === "string"
      ? payload.commentId
      : null;

  if (!commentId) {
    return fail("Comment id is required", 422);
  }

  const [idea] = await db
    .select({
      id: ideas.id,
      ownerId: ideas.ownerId,
      slug: ideas.slug,
    })
    .from(ideas)
    .where(eq(ideas.id, id))
    .limit(1);

  if (!idea) {
    return fail("Idea not found", 404);
  }

  const [comment] = await db
    .select({
      id: ideaComments.id,
      authorId: ideaComments.authorId,
    })
    .from(ideaComments)
    .where(and(eq(ideaComments.id, commentId), eq(ideaComments.ideaId, id)))
    .limit(1);

  if (!comment) {
    return fail("Comment not found", 404);
  }

  const canDelete =
    session.profile.id === idea.ownerId || session.profile.id === comment.authorId;

  if (!canDelete) {
    return fail("Forbidden", 403);
  }

  await db.delete(ideaComments).where(eq(ideaComments.id, commentId));

  revalidatePath(`/ideas/${idea.slug}`);
  revalidatePath(`/dashboard/ideas/${id}`);

  return ok({ deleted: true, commentId });
}
