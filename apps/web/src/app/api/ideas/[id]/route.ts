import { updateIdeaSchema } from "@tubmind/contracts/idea";
import {
  deleteIdea,
  getIdea,
  updateIdea,
} from "@/features/ideas/server/idea-service";
import { fail, ok } from "@/lib/http";
import { handleRoute } from "@/lib/route-handler";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await context.params;
    return ok(await getIdea(id));
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await context.params;
    const parsed = updateIdeaSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return fail("Validation failed", 422, parsed.error.flatten());
    }

    return ok(await updateIdea(id, parsed.data));
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await context.params;
    return ok(await deleteIdea(id));
  });
}
