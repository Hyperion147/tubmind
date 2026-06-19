import { eq } from "drizzle-orm";

import { db } from "@/db";
import { ideas, moderationLogs } from "@tubmind/database";
import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type AdminIdeaAction =
  | "make_public"
  | "make_private"
  | "request_revision"
  | "archive"
  | "delete";

const actionMap: Record<
  Exclude<AdminIdeaAction, "make_public" | "make_private" | "archive" | "delete"> | "make_public" | "make_private" | "archive" | "delete",
  "publish" | "hide" | "request_revision" | "delete_idea"
> = {
  make_public: "publish",
  make_private: "hide",
  request_revision: "request_revision",
  archive: "hide",
  delete: "delete_idea",
};

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  const { id } = await context.params;

  let payload: { action?: AdminIdeaAction; note?: string } | null = null;

  try {
    payload = (await request.json()) as { action?: AdminIdeaAction; note?: string };
  } catch {
    return fail("Invalid JSON body", 400);
  }

  if (!payload?.action) {
    return fail("Action is required", 422);
  }

  const action = payload.action;

  const [existingIdea] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);

  if (!existingIdea) {
    return fail("Idea not found", 404);
  }

  if (payload.action === "delete") {
    let createdLog:
      | {
          id: string;
          action: string;
          note: string | null;
          createdAtLabel: string;
          label: string;
        }
      | null = null;

    await db.transaction(async (tx) => {
      const [log] = await tx
        .insert(moderationLogs)
        .values({
        adminId: session.profile.id,
        action: actionMap[action],
        targetIdeaId: id,
        note: payload.note?.trim() || null,
        })
        .returning();

      createdLog = {
        id: log.id,
        action: log.action,
        note: log.note,
        createdAtLabel: log.createdAt.toLocaleDateString(),
        label: existingIdea.title,
      };

      await tx.delete(ideas).where(eq(ideas.id, id));
    });

    return ok({
      idea: null,
      deleted: true,
      log: createdLog,
    });
  }

  const nextValues = (() => {
    switch (payload.action) {
      case "make_public":
        return {
          visibility: "public" as const,
          publishedAt: existingIdea.publishedAt ?? new Date(),
        };
      case "make_private":
        return {
          visibility: "private" as const,
          publishedAt: null,
        };
      case "request_revision":
        return {
          status: "needs_revision" as const,
          visibility: "private" as const,
          publishedAt: null,
        };
      case "archive":
        return {
          status: "archived" as const,
          visibility: "private" as const,
          publishedAt: null,
        };
    }
  })();

  const [updatedIdea, createdLog] = await db.transaction(async (tx) => {
    const [idea] = await tx
      .update(ideas)
      .set({
        ...nextValues,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(ideas.id, id))
      .returning();

    const [log] = await tx
      .insert(moderationLogs)
      .values({
        adminId: session.profile.id,
        action: actionMap[action],
        targetIdeaId: id,
        note: payload.note?.trim() || null,
      })
      .returning();

    return [
      idea,
      {
        id: log.id,
        action: log.action,
        note: log.note,
        createdAtLabel: log.createdAt.toLocaleDateString(),
        label: idea.title,
      },
    ] as const;
  });

  return ok({
    idea: {
      id: updatedIdea.id,
      visibility: updatedIdea.visibility,
      status: updatedIdea.status,
    },
    deleted: false,
    log: createdLog,
  });
}
