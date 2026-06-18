import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { ideas, timeLogs } from "@/db/schema";
import { getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { createTimeLogSchema } from "@/lib/validators/time-log";

export async function GET() {
  const { session } = await getCurrentSessionAccess();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  const logs = await db
    .select()
    .from(timeLogs)
    .where(eq(timeLogs.ownerId, session.profile.id))
    .orderBy(desc(timeLogs.startedAt));

  return ok(logs);
}

export async function POST(request: Request) {
  const { session, isBlocked } = await getCurrentSessionAccess();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  if (isBlocked) {
    return fail("Blocked users cannot create time logs", 403);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = createTimeLogSchema.safeParse(payload);

  if (!parsed.success) {
    return fail("Validation failed", 422, parsed.error.flatten());
  }

  const [idea] = await db
    .select({
      id: ideas.id,
      ownerId: ideas.ownerId,
    })
    .from(ideas)
    .where(eq(ideas.id, parsed.data.ideaId))
    .limit(1);

  if (!idea || idea.ownerId !== session.profile.id) {
    return fail("Task project not found", 404);
  }

  const [log] = await db
    .insert(timeLogs)
    .values({
      ownerId: session.profile.id,
      ideaId: parsed.data.ideaId,
      taskId: parsed.data.taskId,
      taskTitle: parsed.data.taskTitle,
      startedAt: new Date(parsed.data.startedAt),
      endedAt: new Date(parsed.data.endedAt),
      durationSeconds: parsed.data.durationSeconds,
      notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null,
    })
    .returning();

  return ok(log, { status: 201 });
}
