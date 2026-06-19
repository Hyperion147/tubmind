import {
  adminCommentResultSchema,
  adminIdeaResultSchema,
  adminUserResultSchema,
  type AdminCommentInput,
  type AdminIdeaInput,
  type AdminUserInput,
} from "@tubmind/contracts";

import { jsonInit, type RequestFunction } from "./core";

export function createModerationApi(request: RequestFunction) {
  return {
    comment: (commentId: string, input: AdminCommentInput) =>
      request(
        `/api/admin/comments/${commentId}/moderate`,
        jsonInit("POST", input),
        adminCommentResultSchema,
        "Failed to moderate comment",
      ),
    idea: (ideaId: string, input: AdminIdeaInput) =>
      request(
        `/api/admin/ideas/${ideaId}/moderate`,
        jsonInit("POST", input),
        adminIdeaResultSchema,
        "Failed to moderate idea",
      ),
    user: (userId: string, input: AdminUserInput) =>
      request(
        `/api/admin/users/${userId}/moderate`,
        jsonInit("POST", input),
        adminUserResultSchema,
        "Failed to moderate user",
      ),
  };
}
