import { toggleIdeaReaction } from "@/features/ideas/server/reaction-service";
import { getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { handleRoute } from "@/lib/route-handler";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await context.params;
    const { session, isBlocked } = await getCurrentSessionAccess();

    if (!session) {
      return fail("Unauthorized", 401);
    }

    if (isBlocked) {
      return fail("Blocked users cannot react", 403);
    }

    return ok(
      await toggleIdeaReaction({
        ideaId: id,
        userId: session.profile.id,
      }),
    );
  });
}
