import { createIdeaSchema } from "@tubmind/contracts/idea";
import {
  createIdea,
  listIdeas,
} from "@/features/ideas/server/idea-service";
import { fail, ok } from "@/lib/http";
import { handleRoute } from "@/lib/route-handler";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const scope = new URL(request.url).searchParams.get("scope") ?? "public";
    return ok(await listIdeas(scope));
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const parsed = createIdeaSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return fail("Validation failed", 422, parsed.error.flatten());
    }

    return ok(await createIdea(parsed.data), { status: 201 });
  });
}
