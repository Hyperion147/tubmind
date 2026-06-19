"use client";

import { useMutation } from "@tanstack/react-query";

import { toggleReaction } from "@tubmind/api-client";
import type { ToggleReactionResult } from "@tubmind/contracts/reaction";

export function useToggleReaction(
  ideaId: string,
  options?: {
    onSuccess?: (result: ToggleReactionResult) => void;
  },
) {
  return useMutation<ToggleReactionResult, Error, void>({
    mutationFn: () => toggleReaction(ideaId),
    onSuccess: options?.onSuccess,
  });
}