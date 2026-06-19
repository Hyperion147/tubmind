import { adminUserInputSchema } from "@tubmind/contracts/moderation";
import { moderateUser } from "@/features/admin/server/moderation-service";
import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { handleRoute } from "@/lib/route-handler";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const session = await requireAdmin();
    const { id } = await context.params;
    const parsed = adminUserInputSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return fail("Validation failed", 422, parsed.error.flatten());
    }

    return ok(
      await moderateUser({
        userId: id,
        adminId: session.profile.id,
        data: parsed.data,
      }),
    );
  });
}
