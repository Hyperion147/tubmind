import "server-only";

import { and, desc, eq } from "drizzle-orm";

import type {
  CreateCommentInput,
  DeleteCommentResult,
  IdeaComment,
} from "@tubmind/contracts/comment";
import { ideaComments, ideas, profiles } from "@tubmind/database";
import { isIdeaLive } from "@tubmind/domain";
import { db } from "@/db";
import { ServiceError } from "@/server/service-error";

const commentSelection = {
  id: ideaComments.id,
  body: ideaComments.body,
  status: ideaComments.status,
  parentCommentId: ideaComments.parentCommentId,
  createdAt: ideaComments.createdAt,
  updatedAt: ideaComments.updatedAt,
  authorId: profiles.id,
  authorName: profiles.displayName,
  authorAvatarUrl: profiles.avatarUrl,
};

function toCommentDto(
  comment: Omit<IdeaComment, "createdAt" | "updatedAt"> & {
    createdAt: Date;
    updatedAt: Date;
  },
): IdeaComment {
  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export async function listIdeaComments(ideaId: string): Promise<IdeaComment[]> {
  const comments = await db
    .select(commentSelection)
    .from(ideaComments)
    .innerJoin(profiles, eq(ideaComments.authorId, profiles.id))
    .where(
      and(
        eq(ideaComments.ideaId, ideaId),
        eq(ideaComments.status, "visible"),
      ),
    )
    .orderBy(desc(ideaComments.createdAt));

  return comments.map(toCommentDto);
}

export async function createIdeaComment(input: {
  ideaId: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  data: CreateCommentInput;
}) {
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
    .where(eq(ideas.id, input.ideaId))
    .limit(1);

  if (!idea) throw new ServiceError("Idea not found", 404);

  if (
    !idea.allowComments ||
    (!isIdeaLive(idea) && idea.ownerId !== input.author.id)
  ) {
    throw new ServiceError("Comments are disabled for this idea", 403);
  }

  const [comment] = await db
    .insert(ideaComments)
    .values({
      ideaId: input.ideaId,
      authorId: input.author.id,
      parentCommentId: input.data.parentCommentId,
      body: input.data.body,
    })
    .returning();

  return {
    slug: idea.slug,
    comment: toCommentDto({
      ...comment,
      authorName: input.author.displayName,
      authorAvatarUrl: input.author.avatarUrl,
    }),
  };
}

export async function deleteIdeaComment(input: {
  ideaId: string;
  commentId: string;
  userId: string;
}): Promise<{ slug: string; result: DeleteCommentResult }> {
  const [idea] = await db
    .select({ id: ideas.id, ownerId: ideas.ownerId, slug: ideas.slug })
    .from(ideas)
    .where(eq(ideas.id, input.ideaId))
    .limit(1);

  if (!idea) throw new ServiceError("Idea not found", 404);

  const [comment] = await db
    .select({ id: ideaComments.id, authorId: ideaComments.authorId })
    .from(ideaComments)
    .where(
      and(
        eq(ideaComments.id, input.commentId),
        eq(ideaComments.ideaId, input.ideaId),
      ),
    )
    .limit(1);

  if (!comment) throw new ServiceError("Comment not found", 404);
  if (input.userId !== idea.ownerId && input.userId !== comment.authorId) {
    throw new ServiceError("Forbidden", 403);
  }

  await db.delete(ideaComments).where(eq(ideaComments.id, input.commentId));

  return {
    slug: idea.slug,
    result: { deleted: true, commentId: input.commentId },
  };
}
