import "server-only";

import { eq } from "drizzle-orm";

import type {
  AdminCommentInput,
  AdminCommentResult,
  AdminIdeaAction,
  AdminIdeaInput,
  AdminIdeaResult,
  AdminUserInput,
  AdminUserResult,
} from "@tubmind/contracts/moderation";
import {
  ideaComments,
  ideas,
  moderationLogs,
  profiles,
} from "@tubmind/database";
import { db } from "@/db";
import { ServiceError } from "@/server/service-error";

const ideaActionMap: Record<
  AdminIdeaAction,
  "publish" | "hide" | "request_revision" | "delete_idea"
> = {
  make_public: "publish",
  make_private: "hide",
  request_revision: "request_revision",
  archive: "hide",
  delete: "delete_idea",
};

export async function moderateComment(input: {
  commentId: string;
  adminId: string;
  data: AdminCommentInput;
}): Promise<AdminCommentResult> {
  const [existingComment] = await db
    .select()
    .from(ideaComments)
    .where(eq(ideaComments.id, input.commentId))
    .limit(1);

  if (!existingComment) throw new ServiceError("Comment not found", 404);

  const nextStatus =
    input.data.action === "hide"
      ? "hidden"
      : input.data.action === "delete"
        ? "deleted"
        : "visible";
  const notePrefix = `[${input.data.action}]`;
  const note = input.data.note?.trim() || null;

  const [updatedComment, createdLog] = await db.transaction(async (tx) => {
    const [comment] = await tx
      .update(ideaComments)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(ideaComments.id, input.commentId))
      .returning();

    if (input.data.action === "restore") {
      return [comment, null] as const;
    }

    const [created] = await tx
      .insert(moderationLogs)
      .values({
        adminId: input.adminId,
        action: "delete_comment",
        targetCommentId: input.commentId,
        targetIdeaId: existingComment.ideaId,
        targetUserId: existingComment.authorId,
        note: note ? `${notePrefix} ${note}` : notePrefix,
      })
      .returning();

    return [
      comment,
      {
        id: created.id,
        action: created.action,
        note: created.note,
        createdAtLabel: created.createdAt.toLocaleDateString(),
        label: existingComment.body.slice(0, 72) || "Comment removed",
      },
    ] as const;
  });

  return {
    comment: { id: updatedComment.id, status: updatedComment.status },
    log: createdLog,
  };
}

export async function moderateIdea(input: {
  ideaId: string;
  adminId: string;
  data: AdminIdeaInput;
}): Promise<AdminIdeaResult> {
  const [existingIdea] = await db
    .select()
    .from(ideas)
    .where(eq(ideas.id, input.ideaId))
    .limit(1);

  if (!existingIdea) throw new ServiceError("Idea not found", 404);

  if (input.data.action === "delete") {
    let createdLog: AdminIdeaResult["log"] = null;

    await db.transaction(async (tx) => {
      const [log] = await tx
        .insert(moderationLogs)
        .values({
          adminId: input.adminId,
          action: ideaActionMap[input.data.action],
          targetIdeaId: input.ideaId,
          note: input.data.note?.trim() || null,
        })
        .returning();

      createdLog = {
        id: log.id,
        action: log.action,
        note: log.note,
        createdAtLabel: log.createdAt.toLocaleDateString(),
        label: existingIdea.title,
      };
      await tx.delete(ideas).where(eq(ideas.id, input.ideaId));
    });

    return { idea: null, deleted: true, log: createdLog };
  }

  const nextValues = (() => {
    switch (input.data.action) {
      case "make_public":
        return {
          visibility: "public" as const,
          publishedAt: existingIdea.publishedAt ?? new Date(),
        };
      case "make_private":
        return { visibility: "private" as const, publishedAt: null };
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
      .where(eq(ideas.id, input.ideaId))
      .returning();

    const [log] = await tx
      .insert(moderationLogs)
      .values({
        adminId: input.adminId,
        action: ideaActionMap[input.data.action],
        targetIdeaId: input.ideaId,
        note: input.data.note?.trim() || null,
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

  return {
    idea: {
      id: updatedIdea.id,
      visibility: updatedIdea.visibility,
      status: updatedIdea.status,
    },
    deleted: false,
    log: createdLog,
  };
}

export async function moderateUser(input: {
  userId: string;
  adminId: string;
  data: AdminUserInput;
}): Promise<AdminUserResult> {
  if (input.userId === input.adminId) {
    throw new ServiceError("You cannot moderate your own account here", 403);
  }

  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, input.userId))
    .limit(1);

  if (!existingProfile) throw new ServiceError("User not found", 404);

  const note = input.data.note?.trim() || null;
  const updateValues = (() => {
    switch (input.data.action) {
      case "set_active":
      case "unblock":
        return { status: "active" as const, blockedReason: null };
      case "set_under_review":
        return { status: "under_review" as const };
      case "block":
        return { status: "blocked" as const, blockedReason: note };
      case "make_admin":
        return { role: "admin" as const };
      case "make_user":
        return { role: "user" as const };
    }
  })();

  const [updatedProfile, createdLog] = await db.transaction(async (tx) => {
    const [profile] = await tx
      .update(profiles)
      .set({ ...updateValues, updatedAt: new Date() })
      .where(eq(profiles.id, input.userId))
      .returning();

    if (
      input.data.action !== "block" &&
      input.data.action !== "unblock"
    ) {
      return [profile, null] as const;
    }

    const [created] = await tx
      .insert(moderationLogs)
      .values({
        adminId: input.adminId,
        action:
          input.data.action === "block" ? "block_user" : "unblock_user",
        targetUserId: input.userId,
        note,
      })
      .returning();

    return [
      profile,
      {
        id: created.id,
        action: created.action,
        note: created.note,
        createdAtLabel: created.createdAt.toLocaleDateString(),
        label: profile.displayName,
      },
    ] as const;
  });

  return {
    profile: {
      id: updatedProfile.id,
      role: updatedProfile.role,
      status: updatedProfile.status,
      blockedReason: updatedProfile.blockedReason,
    },
    log: createdLog,
  };
}
