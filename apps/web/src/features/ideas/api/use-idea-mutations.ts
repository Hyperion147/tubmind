"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tubmindApi } from "@tubmind/api-client";
import type {
  CreateIdeaInput,
  DeleteIdeaResult,
  IdeaMutationResult,
  UpdateIdeaInput,
} from "@tubmind/contracts/idea";

import { ideaQueryKeys } from "./query-keys";

type MutationOptions<TData, TVariables> = {
  onError?: (error: Error, variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
};

export function useCreateIdea(
  options?: MutationOptions<IdeaMutationResult, CreateIdeaInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<IdeaMutationResult, Error, CreateIdeaInput>({
    mutationFn: tubmindApi.ideas.create,
    onSuccess: async (data, values) => {
      await queryClient.invalidateQueries({ queryKey: ideaQueryKeys.mine });
      await options?.onSuccess?.(data, values);
    },
    onError: options?.onError,
  });
}

export function useUpdateIdea(
  ideaId: string,
  options?: MutationOptions<IdeaMutationResult, UpdateIdeaInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<IdeaMutationResult, Error, UpdateIdeaInput>({
    mutationFn: (values) => tubmindApi.ideas.update(ideaId, values),
    onSuccess: async (data, values) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ideaQueryKeys.mine }),
        queryClient.invalidateQueries({ queryKey: ideaQueryKeys.detail(ideaId) }),
      ]);
      await options?.onSuccess?.(data, values);
    },
    onError: options?.onError,
  });
}

export function useDeleteIdea(
  ideaId: string,
  options?: MutationOptions<DeleteIdeaResult, void>,
) {
  const queryClient = useQueryClient();

  return useMutation<DeleteIdeaResult, Error, void>({
    mutationFn: () => tubmindApi.ideas.remove(ideaId),
    onSuccess: async (data, values) => {
      await queryClient.invalidateQueries({ queryKey: ideaQueryKeys.mine });
      await options?.onSuccess?.(data, values);
    },
    onError: options?.onError,
  });
}
