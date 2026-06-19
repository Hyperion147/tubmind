"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tubmindApi } from "@tubmind/api-client";
import type { IdeaComment } from "@tubmind/contracts/comment";

import { ideaQueryKeys } from "./query-keys";

export type { IdeaComment } from "@tubmind/contracts/comment";

type UseIdeaCommentsOptions = {
  ideaId: string;
  onCommentCreated?: (comment: IdeaComment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onError?: (error: Error) => void;
};

export function useIdeaComments({
  ideaId,
  onCommentCreated,
  onCommentDeleted,
  onError,
}: UseIdeaCommentsOptions) {
  const queryClient = useQueryClient();

  const createComment = useMutation<IdeaComment, Error, string>({
    mutationFn: (body) => tubmindApi.ideas.createComment(ideaId, { body }),
    onSuccess: async (comment) => {
      await queryClient.invalidateQueries({
        queryKey: ideaQueryKeys.comments(ideaId),
      });
      onCommentCreated?.(comment);
    },
    onError,
  });

  const deleteComment = useMutation<string, Error, string>({
    mutationFn: async (commentId) => {
      await tubmindApi.ideas.deleteComment(ideaId, commentId);
      return commentId;
    },
    onSuccess: async (commentId) => {
      await queryClient.invalidateQueries({
        queryKey: ideaQueryKeys.comments(ideaId),
      });
      onCommentDeleted?.(commentId);
    },
    onError,
  });

  return { createComment, deleteComment };
}
