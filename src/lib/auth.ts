import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { createClient } from "@/lib/server";

function getProfileValuesFromUser(user: User) {
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Tubmind User";

  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  return {
    email: user.email ?? "",
    displayName,
    avatarUrl,
  };
}

export async function syncProfileForUser(user: User) {
  const profileValues = getProfileValuesFromUser(user);
  const now = new Date();

  const [profile] = await db
    .insert(profiles)
    .values({
      id: user.id,
      ...profileValues,
      lastLoginAt: now,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        ...profileValues,
        lastLoginAt: now,
        updatedAt: now,
      },
    })
    .returning();

  return profile;
}

export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.name === "AuthSessionMissingError") {
      return null;
    }

    throw error;
  }

  if (!user) {
    return null;
  }

  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  let profile = existingProfile;

  if (!profile) {
    profile = await syncProfileForUser(user);
  }

  return {
    user,
    profile,
  };
}

export async function getCurrentSessionAccess() {
  const session = await getCurrentSession();

  if (!session) {
    return {
      session: null,
      isBlocked: false,
    } as const;
  }

  return {
    session,
    isBlocked: session.profile.status === "blocked",
  } as const;
}

export async function requireUser() {
  const { session, isBlocked } = await getCurrentSessionAccess();

  if (!session) {
    redirect("/login");
  }

  if (isBlocked) {
    redirect("/login?blocked=1");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.profile.role !== "admin") {
    redirect("/");
  }

  return session;
}
