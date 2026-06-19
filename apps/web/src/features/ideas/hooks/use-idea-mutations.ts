"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@tubmind/api-client";
import type { CreateIdeaInput, UpdateIdeaInput } from "@tubmind/contracts/idea";

type MutationOptions<TData, TVariables> = {
  onError?: (error: Error, variables: TVariables) => void;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
};

type CreatedIdea = {
  id: string;
};

export function useCreateIdea(options?: MutationOptions<CreatedIdea, CreateIdeaInput>) {
  const queryClient = useQueryClient();

  return useMutation<CreatedIdea, Error, CreateIdeaInput>({
    mutationFn: (values) =>
      apiRequest<CreatedIdea>(
        "/api/ideas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
        "Failed to create idea",
      ),
    onSuccess: async (createdIdea, values) => {
      await queryClient.invalidateQueries({ queryKey: ["ideas", "mine"] });
      await options?.onSuccess?.(createdIdea, values);
    },
    onError: (error, values) => {
      options?.onError?.(error, values);
    },
  });
}

export function useUpdateIdea(
  ideaId: string,
  options?: MutationOptions<unknown, UpdateIdeaInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateIdeaInput>({
    mutationFn: (values) =>
      apiRequest<unknown>(
        `/api/ideas/${ideaId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
        "Failed to update idea",
      ),
    onSuccess: async (data, values) => {
      await queryClient.invalidateQueries({ queryKey: ["ideas", "mine"] });
      await options?.onSuccess?.(data, values);
    },
    onError: (error, values) => {
      options?.onError?.(error, values);
    },
  });
}

export function useDeleteIdea(
  ideaId: string,
  options?: MutationOptions<unknown, void>,
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, void>({
    mutationFn: () =>
      apiRequest<unknown>(
        `/api/ideas/${ideaId}`,
        {
          method: "DELETE",
        },
        "Failed to delete idea",
      ),
    onSuccess: async (data, values) => {
      await queryClient.invalidateQueries({ queryKey: ["ideas", "mine"] });
      await options?.onSuccess?.(data, values);
    },
    onError: (error, values) => {
      options?.onError?.(error, values);
    },
  });
}
