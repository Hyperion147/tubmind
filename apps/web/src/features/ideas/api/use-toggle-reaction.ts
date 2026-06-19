"use client";

import { useMutation } from "@tanstack/react-query";

import { tubmindApi } from "@tubmind/api-client";
import type { ToggleReactionResult } from "@tubmind/contracts/reaction";

export function useToggleReaction(
  ideaId: string,
  options?: {
    onSuccess?: (result: ToggleReactionResult) => void;
  },
) {
  return useMutation<ToggleReactionResult, Error, void>({
    mutationFn: () => tubmindApi.ideas.toggleReaction(ideaId),
    onSuccess: options?.onSuccess,
  });
}
