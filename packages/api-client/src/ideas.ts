import {
  deleteCommentResultSchema,
  deleteIdeaResultSchema,
  ideaCommentSchema,
  ideaDetailResultSchema,
  ideaMutationResultSchema,
  myIdeaSummarySchema,
  publicIdeaSummarySchema,
  toggleReactionResultSchema,
  type CreateCommentInput,
  type CreateIdeaInput,
  type UpdateIdeaInput,
} from "@tubmind/contracts";

import { jsonInit, type RequestFunction } from "./core";

export function createIdeasApi(request: RequestFunction) {
  return {
    listMine: () =>
      request(
        "/api/ideas?scope=mine",
        undefined,
        myIdeaSummarySchema.array(),
        "Failed to load your ideas",
      ),
    listPublic: () =>
      request(
        "/api/ideas",
        undefined,
        publicIdeaSummarySchema.array(),
        "Failed to load public ideas",
      ),
    get: (ideaId: string) =>
      request(
        `/api/ideas/${ideaId}`,
        undefined,
        ideaDetailResultSchema,
        "Failed to load idea",
      ),
    create: (input: CreateIdeaInput) =>
      request(
        "/api/ideas",
        jsonInit("POST", input),
        ideaMutationResultSchema,
        "Failed to create idea",
      ),
    update: (ideaId: string, input: UpdateIdeaInput) =>
      request(
        `/api/ideas/${ideaId}`,
        jsonInit("PATCH", input),
        ideaMutationResultSchema,
        "Failed to update idea",
      ),
    remove: (ideaId: string) =>
      request(
        `/api/ideas/${ideaId}`,
        { method: "DELETE" },
        deleteIdeaResultSchema,
        "Failed to delete idea",
      ),
    toggleReaction: (ideaId: string) =>
      request(
        `/api/ideas/${ideaId}/reactions`,
        { method: "POST" },
        toggleReactionResultSchema,
        "Failed to update reaction",
      ),
    listComments: (ideaId: string) =>
      request(
        `/api/ideas/${ideaId}/comments`,
        undefined,
        ideaCommentSchema.array(),
        "Failed to load comments",
      ),
    createComment: (ideaId: string, input: CreateCommentInput) =>
      request(
        `/api/ideas/${ideaId}/comments`,
        jsonInit("POST", input),
        ideaCommentSchema,
        "Failed to add comment",
      ),
    deleteComment: (ideaId: string, commentId: string) =>
      request(
        `/api/ideas/${ideaId}/comments`,
        jsonInit("DELETE", { commentId }),
        deleteCommentResultSchema,
        "Failed to delete comment",
      ),
  };
}
