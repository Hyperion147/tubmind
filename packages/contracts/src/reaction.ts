import { z } from "zod/v4";

export const toggleReactionResultSchema = z.object({
  reacted: z.boolean(),
  count: z.number().int().nonnegative(),
});

export type ToggleReactionResult = z.infer<
  typeof toggleReactionResultSchema
>;
