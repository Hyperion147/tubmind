import "server-only";

import { desc, eq } from "drizzle-orm";

import type { CreateTimeLogInput, TimeLog } from "@tubmind/contracts/time-log";
import { ideas, timeLogs } from "@tubmind/database";
import { db } from "@/db";
import { ServiceError } from "@/server/service-error";

function toTimeLogDto(log: typeof timeLogs.$inferSelect): TimeLog {
  return {
    id: log.id,
    ideaId: log.ideaId,
    taskId: log.taskId,
    taskTitle: log.taskTitle,
    startedAt: log.startedAt.toISOString(),
    endedAt: log.endedAt.toISOString(),
    durationSeconds: log.durationSeconds,
    notes: log.notes,
  };
}

export async function listTimeLogs(ownerId: string) {
  const logs = await db
    .select()
    .from(timeLogs)
    .where(eq(timeLogs.ownerId, ownerId))
    .orderBy(desc(timeLogs.startedAt));

  return logs.map(toTimeLogDto);
}

export async function createTimeLog(input: {
  ownerId: string;
  data: CreateTimeLogInput;
}): Promise<TimeLog> {
  const [idea] = await db
    .select({ id: ideas.id, ownerId: ideas.ownerId })
    .from(ideas)
    .where(eq(ideas.id, input.data.ideaId))
    .limit(1);

  if (!idea || idea.ownerId !== input.ownerId) {
    throw new ServiceError("Task project not found", 404);
  }

  const [log] = await db
    .insert(timeLogs)
    .values({
      ownerId: input.ownerId,
      ideaId: input.data.ideaId,
      taskId: input.data.taskId,
      taskTitle: input.data.taskTitle,
      startedAt: new Date(input.data.startedAt),
      endedAt: new Date(input.data.endedAt),
      durationSeconds: input.data.durationSeconds,
      notes: input.data.notes?.trim() ? input.data.notes.trim() : null,
    })
    .returning();

  return toTimeLogDto(log);
}
