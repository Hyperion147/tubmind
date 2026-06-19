import { z } from "zod";

export const commentStatusSchema = z.enum(["visible", "hidden", "deleted"]);

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  parentCommentId: z.uuid().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const ideaCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  status: commentStatusSchema,
  parentCommentId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatarUrl: z.string().nullable(),
});

export const deleteCommentInputSchema = z.object({
  commentId: z.string().min(1),
});

export const deleteCommentResultSchema = z.object({
  deleted: z.literal(true),
  commentId: z.string(),
});

export type CommentStatus = z.infer<typeof commentStatusSchema>;
export type IdeaComment = z.infer<typeof ideaCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>;
export type DeleteCommentResult = z.infer<typeof deleteCommentResultSchema>;
