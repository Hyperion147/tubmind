import { eq } from "drizzle-orm";

import { db } from "@/db";
import { ideaComments, moderationLogs } from "@tubmind/database";
import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type AdminCommentAction = "hide" | "restore" | "delete";

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  const { id } = await context.params;

  let payload: { action?: AdminCommentAction; note?: string } | null = null;

  try {
    payload = (await request.json()) as {
      action?: AdminCommentAction;
      note?: string;
    };
  } catch {
    return fail("Invalid JSON body", 400);
  }

  if (!payload?.action) {
    return fail("Action is required", 422);
  }

  const [existingComment] = await db
    .select()
    .from(ideaComments)
    .where(eq(ideaComments.id, id))
    .limit(1);

  if (!existingComment) {
    return fail("Comment not found", 404);
  }

  const nextStatus =
    payload.action === "hide"
      ? "hidden"
      : payload.action === "delete"
        ? "deleted"
        : "visible";

  const notePrefix =
    payload.action === "hide"
      ? "[hide]"
      : payload.action === "delete"
        ? "[delete]"
        : "[restore]";

  const note = payload.note?.trim() || null;

  const [updatedComment, createdLog] = await db.transaction(async (tx) => {
    const [comment] = await tx
      .update(ideaComments)
      .set({
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(ideaComments.id, id))
      .returning();

    let log:
      | {
          id: string;
          action: string;
          note: string | null;
          createdAtLabel: string;
          label: string;
        }
      | null = null;

    if (payload?.action !== "restore") {
      const [created] = await tx
        .insert(moderationLogs)
        .values({
          adminId: session.profile.id,
          action: "delete_comment",
          targetCommentId: id,
          targetIdeaId: existingComment.ideaId,
          targetUserId: existingComment.authorId,
          note: note ? `${notePrefix} ${note}` : notePrefix,
        })
        .returning();

      log = {
        id: created.id,
        action: created.action,
        note: created.note,
        createdAtLabel: created.createdAt.toLocaleDateString(),
        label: existingComment.body.slice(0, 72) || "Comment removed",
      };
    }

    return [comment, log] as const;
  });

  return ok({
    comment: {
      id: updatedComment.id,
      status: updatedComment.status,
    },
    log: createdLog,
  });
}
