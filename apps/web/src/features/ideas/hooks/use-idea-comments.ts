"use client";

import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "@tubmind/api-client";

export type IdeaComment = {
  id: string;
  body: string;
  createdAt: string | Date;
  authorId?: string | null;
  authorName?: string | null;
};

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
  const createComment = useMutation<IdeaComment, Error, string>({
    mutationFn: (body) =>
      apiRequest<IdeaComment>(
        `/api/ideas/${ideaId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body }),
        },
        "Failed to add comment",
      ),
    onSuccess: onCommentCreated,
    onError,
  });

  const deleteComment = useMutation<string, Error, string>({
    mutationFn: async (commentId) => {
      await apiRequest<unknown>(
        `/api/ideas/${ideaId}/comments`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ commentId }),
        },
        "Failed to delete comment",
      );

      return commentId;
    },
    onSuccess: onCommentDeleted,
    onError,
  });

  return {
    createComment,
    deleteComment,
  };
}
