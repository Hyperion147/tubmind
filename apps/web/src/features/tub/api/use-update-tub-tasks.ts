"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tubmindApi } from "@tubmind/api-client";
import type { IdeaMutationResult } from "@tubmind/contracts/idea";
import type { emptyIdeaTubData } from "@tubmind/domain/tub";
import { ideaQueryKeys } from "@/features/ideas/api/query-keys";

type IdeaTubData = typeof emptyIdeaTubData;

type UseUpdateTubTasksOptions = {
  ideaId: string;
  onError?: (error: Error, tubData: IdeaTubData) => void;
  onSuccess?: (
    data: IdeaMutationResult,
    tubData: IdeaTubData,
  ) => void | Promise<void>;
};

export function useUpdateTubTasks({
  ideaId,
  onError,
  onSuccess,
}: UseUpdateTubTasksOptions) {
  const queryClient = useQueryClient();

  return useMutation<IdeaMutationResult, Error, IdeaTubData>({
    mutationFn: (nextTubData) =>
      tubmindApi.ideas.update(ideaId, {
        details: {
          metadata: {
            tub: nextTubData,
          },
        },
      }),
    onSuccess: async (data, tubData) => {
      await queryClient.invalidateQueries({ queryKey: ideaQueryKeys.mine });
      await onSuccess?.(data, tubData);
    },
    onError,
  });
}
