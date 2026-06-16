import { eq } from "drizzle-orm";

import { db } from "@/db";
import { moderationLogs, profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type AdminUserAction =
  | "set_active"
  | "set_under_review"
  | "block"
  | "unblock"
  | "make_admin"
  | "make_user";

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  const { id } = await context.params;

  if (id === session.profile.id) {
    return fail("You cannot moderate your own account here", 403);
  }

  let payload: { action?: AdminUserAction; note?: string } | null = null;

  try {
    payload = (await request.json()) as { action?: AdminUserAction; note?: string };
  } catch {
    return fail("Invalid JSON body", 400);
  }

  if (!payload?.action) {
    return fail("Action is required", 422);
  }

  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  if (!existingProfile) {
    return fail("User not found", 404);
  }

  const note = payload.note?.trim() || null;

  const updateValues = (() => {
    switch (payload?.action) {
      case "set_active":
        return {
          status: "active" as const,
          blockedReason: null,
        };
      case "set_under_review":
        return {
          status: "under_review" as const,
        };
      case "block":
        return {
          status: "blocked" as const,
          blockedReason: note,
        };
      case "unblock":
        return {
          status: "active" as const,
          blockedReason: null,
        };
      case "make_admin":
        return {
          role: "admin" as const,
        };
      case "make_user":
        return {
          role: "user" as const,
        };
    }
  })();

  const [updatedProfile, createdLog] = await db.transaction(async (tx) => {
    const [profile] = await tx
      .update(profiles)
      .set({
        ...updateValues,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id))
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

    if (payload?.action === "block" || payload?.action === "unblock") {
      const [created] = await tx
        .insert(moderationLogs)
        .values({
          adminId: session.profile.id,
          action: payload.action === "block" ? "block_user" : "unblock_user",
          targetUserId: id,
          note,
        })
        .returning();

      log = {
        id: created.id,
        action: created.action,
        note: created.note,
        createdAtLabel: created.createdAt.toLocaleDateString(),
        label: profile.displayName,
      };
    }

    return [profile, log] as const;
  });

  return ok({
    profile: {
      id: updatedProfile.id,
      role: updatedProfile.role,
      status: updatedProfile.status,
      blockedReason: updatedProfile.blockedReason,
    },
    log: createdLog,
  });
}
