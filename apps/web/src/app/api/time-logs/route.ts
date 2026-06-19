import { createTimeLogSchema } from "@tubmind/contracts/time-log";
import {
  createTimeLog,
  listTimeLogs,
} from "@/features/workspace/server/time-log-service";
import { getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { handleRoute } from "@/lib/route-handler";

export async function GET() {
  return handleRoute(async () => {
    const { session } = await getCurrentSessionAccess();
    return session
      ? ok(await listTimeLogs(session.profile.id))
      : fail("Unauthorized", 401);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { session, isBlocked } = await getCurrentSessionAccess();

    if (!session) return fail("Unauthorized", 401);
    if (isBlocked) return fail("Blocked users cannot create time logs", 403);

    const payload = await request.json().catch(() => null);
    const parsed = createTimeLogSchema.safeParse(payload);

    if (!parsed.success) {
      return fail("Validation failed", 422, parsed.error.flatten());
    }

    return ok(
      await createTimeLog({
        ownerId: session.profile.id,
        data: parsed.data,
      }),
      { status: 201 },
    );
  });
}
