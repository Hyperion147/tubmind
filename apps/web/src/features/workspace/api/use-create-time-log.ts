"use client";

import { useMutation } from "@tanstack/react-query";

import { tubmindApi } from "@tubmind/api-client";
import type { CreateTimeLogInput, TimeLog } from "@tubmind/contracts/time-log";

export function useCreateTimeLog(options?: {
  onSuccess?: (timeLog: TimeLog, input: CreateTimeLogInput) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<TimeLog, Error, CreateTimeLogInput>({
    mutationFn: tubmindApi.timeLogs.create,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
