"use client";

import { useMutation } from "@tanstack/react-query";

import { tubmindApi } from "@tubmind/api-client";
import type {
  AdminCommentInput,
  AdminCommentResult,
  AdminIdeaInput,
  AdminIdeaResult,
  AdminUserInput,
  AdminUserResult,
} from "@tubmind/contracts/moderation";

export function useModerateComment(
  commentId: string,
  onSuccess?: (result: AdminCommentResult) => void,
) {
  return useMutation<AdminCommentResult, Error, AdminCommentInput>({
    mutationFn: (input) => tubmindApi.moderation.comment(commentId, input),
    onSuccess,
  });
}

export function useModerateIdea(
  ideaId: string,
  onSuccess?: (result: AdminIdeaResult) => void,
) {
  return useMutation<AdminIdeaResult, Error, AdminIdeaInput>({
    mutationFn: (input) => tubmindApi.moderation.idea(ideaId, input),
    onSuccess,
  });
}

export function useModerateUser(
  userId: string,
  onSuccess?: (result: AdminUserResult) => void,
) {
  return useMutation<AdminUserResult, Error, AdminUserInput>({
    mutationFn: (input) => tubmindApi.moderation.user(userId, input),
    onSuccess,
  });
}
