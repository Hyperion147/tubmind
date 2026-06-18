"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api-client";
import type { emptyIdeaTubData } from "@/lib/tub";

type IdeaTubData = typeof emptyIdeaTubData;

type UseUpdateTubTasksOptions = {
  ideaId: string;
  onError?: (error: Error, tubData: IdeaTubData) => void;
  onSuccess?: (data: unknown, tubData: IdeaTubData) => void | Promise<void>;
};

export function useUpdateTubTasks({
  ideaId,
  onError,
  onSuccess,
}: UseUpdateTubTasksOptions) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, IdeaTubData>({
    mutationFn: (nextTubData) =>
      apiRequest<unknown>(
        `/api/ideas/${ideaId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            details: {
              metadata: {
                tub: nextTubData,
              },
            },
          }),
        },
        "Failed to save tub workspace",
      ),
    onSuccess: async (data, tubData) => {
      await queryClient.invalidateQueries({ queryKey: ["ideas", "mine"] });
      await onSuccess?.(data, tubData);
    },
    onError,
  });
}
