import { and, count, desc, eq, ilike, inArray, isNotNull, or } from "drizzle-orm";

import { db } from "@/db";
import { ideaComments, ideas, moderationLogs, profiles } from "@/db/schema";
import { AdminUsersPageClient } from "@/features/admin/components/admin-users-page-client";
import { getAdminUserStats } from "@/features/admin/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{
    userQ?: string;
    role?: string;
    userStatus?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await requireAdmin();
  const params = await searchParams;
  const userQuery = params.userQ?.trim() ?? "";
  const roleFilter =
    params.role === "admin" || params.role === "user" ? params.role : "all";
  const userStatusFilter =
    params.userStatus === "active" ||
    params.userStatus === "under_review" ||
    params.userStatus === "blocked" ||
    params.userStatus === "deleted"
      ? params.userStatus
      : "all";

  const userFilters = [
    ...(userQuery
      ? [
          or(
            ilike(profiles.displayName, `%${userQuery}%`),
            ilike(profiles.email, `%${userQuery}%`)
          )!,
        ]
      : []),
    ...(roleFilter !== "all" ? [eq(profiles.role, roleFilter)] : []),
    ...(userStatusFilter !== "all" ? [eq(profiles.status, userStatusFilter)] : []),
  ];

  const userRows = await db
    .select({
      id: profiles.id,
      displayName: profiles.displayName,
      email: profiles.email,
      role: profiles.role,
      status: profiles.status,
      blockedReason: profiles.blockedReason,
      lastLoginAt: profiles.lastLoginAt,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(userFilters.length ? and(...userFilters) : undefined)
    .orderBy(desc(profiles.createdAt))
    .limit(24);

  const shownUserIds = userRows.map((user) => user.id);

  const [
    userStats,
    ideaCounts,
    commentCounts,
    recentLogs,
  ] = await Promise.all([
    getAdminUserStats(),
    shownUserIds.length
      ? db
          .select({ ownerId: ideas.ownerId, value: count() })
          .from(ideas)
          .where(inArray(ideas.ownerId, shownUserIds))
          .groupBy(ideas.ownerId)
      : Promise.resolve([]),
    shownUserIds.length
      ? db
          .select({ authorId: ideaComments.authorId, value: count() })
          .from(ideaComments)
          .where(inArray(ideaComments.authorId, shownUserIds))
          .groupBy(ideaComments.authorId)
      : Promise.resolve([]),
    db
      .select({
        id: moderationLogs.id,
        action: moderationLogs.action,
        note: moderationLogs.note,
        createdAt: moderationLogs.createdAt,
        label: profiles.displayName,
      })
      .from(moderationLogs)
      .innerJoin(profiles, eq(moderationLogs.targetUserId, profiles.id))
      .where(isNotNull(moderationLogs.targetUserId))
      .orderBy(desc(moderationLogs.createdAt))
      .limit(8),
  ]);

  const ideaCountMap = new Map(ideaCounts.map((row) => [row.ownerId, row.value]));
  const commentCountMap = new Map(commentCounts.map((row) => [row.authorId, row.value]));

  return (
    <AdminUsersPageClient
      initialUsers={userRows.map((user) => ({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        status: user.status,
        blockedReason: user.blockedReason,
        lastLoginLabel: user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : "never",
        createdAtLabel: user.createdAt.toLocaleDateString(),
        ideaCount: ideaCountMap.get(user.id) ?? 0,
        commentCount: commentCountMap.get(user.id) ?? 0,
        isSelf: user.id === session.profile.id,
      }))}
      initialLogs={recentLogs.map((log) => ({
        id: log.id,
        action: log.action,
        note: log.note,
        createdAtLabel: log.createdAt.toLocaleDateString(),
        label: log.label ?? "Moderation target removed",
      }))}
      initialStats={{
        totalUsers: userStats.totalUsers,
        blockedUsers: userStats.blockedUsers,
        reviewUsers: userStats.reviewUsers,
        adminUsers: userStats.adminUsers,
      }}
      filters={{
        userQuery,
        roleFilter,
        userStatusFilter,
      }}
    />
  );
}
