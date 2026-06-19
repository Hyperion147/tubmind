import { z } from "zod/v4";

import { commentStatusSchema } from "./comment";
import { ideaStatusSchema, ideaVisibilitySchema } from "./idea";

export const userRoleSchema = z.enum(["user", "admin"]);
export const userStatusSchema = z.enum([
  "active",
  "under_review",
  "blocked",
  "deleted",
]);

export const moderationLogResultSchema = z.object({
  id: z.string(),
  action: z.string(),
  note: z.string().nullable(),
  createdAtLabel: z.string(),
  label: z.string(),
});

const moderationNoteSchema = z.string().trim().max(2000).optional();

export const adminCommentActionSchema = z.enum(["hide", "restore", "delete"]);
export const adminCommentInputSchema = z.object({
  action: adminCommentActionSchema,
  note: moderationNoteSchema,
});
export const adminCommentResultSchema = z.object({
  comment: z.object({
    id: z.string(),
    status: commentStatusSchema,
  }),
  log: moderationLogResultSchema.nullable(),
});

export const adminIdeaActionSchema = z.enum([
  "make_public",
  "make_private",
  "request_revision",
  "archive",
  "delete",
]);
export const adminIdeaInputSchema = z.object({
  action: adminIdeaActionSchema,
  note: moderationNoteSchema,
});
export const adminIdeaResultSchema = z.object({
  idea: z
    .object({
      id: z.string(),
      visibility: ideaVisibilitySchema,
      status: ideaStatusSchema,
    })
    .nullable(),
  deleted: z.boolean(),
  log: moderationLogResultSchema.nullable(),
});

export const adminUserActionSchema = z.enum([
  "set_active",
  "set_under_review",
  "block",
  "unblock",
  "make_admin",
  "make_user",
]);
export const adminUserInputSchema = z.object({
  action: adminUserActionSchema,
  note: moderationNoteSchema,
});
export const adminUserResultSchema = z.object({
  profile: z.object({
    id: z.string(),
    role: userRoleSchema,
    status: userStatusSchema,
    blockedReason: z.string().nullable(),
  }),
  log: moderationLogResultSchema.nullable(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type AdminCommentAction = z.infer<typeof adminCommentActionSchema>;
export type AdminCommentInput = z.infer<typeof adminCommentInputSchema>;
export type AdminCommentResult = z.infer<typeof adminCommentResultSchema>;
export type AdminIdeaAction = z.infer<typeof adminIdeaActionSchema>;
export type AdminIdeaInput = z.infer<typeof adminIdeaInputSchema>;
export type AdminIdeaResult = z.infer<typeof adminIdeaResultSchema>;
export type AdminUserAction = z.infer<typeof adminUserActionSchema>;
export type AdminUserInput = z.infer<typeof adminUserInputSchema>;
export type AdminUserResult = z.infer<typeof adminUserResultSchema>;
