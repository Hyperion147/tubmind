import { z } from "zod/v4";

export const apiErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export function apiSuccessSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({ data: dataSchema });
}

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess<T> = { data: T };
