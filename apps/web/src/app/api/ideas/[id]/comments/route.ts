import { revalidatePath } from "next/cache";

import {
  createCommentSchema,
  deleteCommentInputSchema,
} from "@tubmind/contracts/comment";
import {
  createIdeaComment,
  deleteIdeaComment,
  listIdeaComments,
} from "@/features/ideas/server/comment-service";
import { getCurrentSessionAccess } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { handleRoute } from "@/lib/route-handler";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function revalidateIdeaPaths(ideaId: string, slug: string) {
  revalidatePath(`/listings/${slug}`);
  revalidatePath(`/dashboard/ideas/${ideaId}`);
  revalidatePath(`/dashboard/tubs/${ideaId}`);
}

export async function GET(_: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await context.params;
    return ok(await listIdeaComments(id));
  });
}

export async function POST(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await context.params;
    const { session, isBlocked } = await getCurrentSessionAccess();

    if (!session) return fail("Unauthorized", 401);
    if (isBlocked) return fail("Blocked users cannot comment", 403);

    const parsed = createCommentSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return fail("Validation failed", 422, parsed.error.flatten());
    }

    const result = await createIdeaComment({
      ideaId: id,
      author: {
        id: session.profile.id,
        displayName: session.profile.displayName,
        avatarUrl: session.profile.avatarUrl,
      },
      data: parsed.data,
    });

    revalidateIdeaPaths(id, result.slug);
    return ok(result.comment, { status: 201 });
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await context.params;
    const { session, isBlocked } = await getCurrentSessionAccess();

    if (!session) return fail("Unauthorized", 401);
    if (isBlocked) return fail("Blocked users cannot delete comments", 403);

    const parsed = deleteCommentInputSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return fail("Validation failed", 422, parsed.error.flatten());
    }

    const result = await deleteIdeaComment({
      ideaId: id,
      commentId: parsed.data.commentId,
      userId: session.profile.id,
    });

    revalidateIdeaPaths(id, result.slug);
    return ok(result.result);
  });
}
