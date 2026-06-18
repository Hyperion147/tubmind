import { z } from "zod";

export const createTimeLogSchema = z.object({
  ideaId: z.uuid(),
  taskId: z.string().trim().min(1).max(120),
  taskTitle: z.string().trim().min(1).max(180),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime(),
  durationSeconds: z.int().min(1).max(7 * 24 * 60 * 60),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CreateTimeLogInput = z.infer<typeof createTimeLogSchema>;
