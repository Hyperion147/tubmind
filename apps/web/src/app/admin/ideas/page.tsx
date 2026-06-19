import { and, count, desc, eq, ilike, isNotNull, or } from "drizzle-orm";

import { db } from "@/db";
import { ideas, moderationLogs, profiles } from "@tubmind/database";
import { AdminIdeasPageClient } from "@/features/admin/components/admin-ideas-page-client";
import { getAdminIdeaStats } from "@/features/admin/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";

const PAGE_SIZE = 8;

type IdeaStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "published"
  | "needs_revision"
  | "archived";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    visibility?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function AdminIdeasPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const visibilityFilter =
    params.visibility === "public" || params.visibility === "private"
      ? params.visibility
      : "all";
  const statusFilter =
    params.status === "draft" ||
    params.status === "in_progress" ||
    params.status === "submitted" ||
    params.status === "published" ||
    params.status === "needs_revision" ||
    params.status === "archived"
      ? params.status
      : "all";
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const offset = (page - 1) * PAGE_SIZE;

  const filters = [
    ...(query
      ? [
          or(
            ilike(ideas.title, `%${query}%`),
            ilike(ideas.summary, `%${query}%`),
            ilike(profiles.displayName, `%${query}%`)
          )!,
        ]
      : []),
    ...(visibilityFilter !== "all" ? [eq(ideas.visibility, visibilityFilter)] : []),
    ...(statusFilter !== "all" ? [eq(ideas.status, statusFilter as IdeaStatus)] : []),
  ];

  const [
    ideaRows,
    ideaStats,
    totalFilteredResult,
    recentLogs,
  ] = await Promise.all([
    db
      .select({
        id: ideas.id,
        slug: ideas.slug,
        title: ideas.title,
        summary: ideas.summary,
        status: ideas.status,
        visibility: ideas.visibility,
        allowComments: ideas.allowComments,
        ownerName: profiles.displayName,
        ownerEmail: profiles.email,
        updatedAt: ideas.updatedAt,
      })
      .from(ideas)
      .innerJoin(profiles, eq(ideas.ownerId, profiles.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(ideas.updatedAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    getAdminIdeaStats(),
    db
      .select({ value: count() })
      .from(ideas)
      .innerJoin(profiles, eq(ideas.ownerId, profiles.id))
      .where(filters.length ? and(...filters) : undefined),
    db
      .select({
        id: moderationLogs.id,
        action: moderationLogs.action,
        note: moderationLogs.note,
        createdAt: moderationLogs.createdAt,
        label: ideas.title,
      })
      .from(moderationLogs)
      .innerJoin(ideas, eq(moderationLogs.targetIdeaId, ideas.id))
      .where(isNotNull(moderationLogs.targetIdeaId))
      .orderBy(desc(moderationLogs.createdAt))
      .limit(6),
  ]);

  const totalPages = Math.max(1, Math.ceil((totalFilteredResult[0]?.value ?? 0) / PAGE_SIZE));

  return (
    <AdminIdeasPageClient
      initialIdeas={ideaRows.map((idea) => ({
        id: idea.id,
        slug: idea.slug,
        title: idea.title,
        summary: idea.summary,
        status: idea.status,
        visibility: idea.visibility === "public" ? "public" : "private",
        allowComments: idea.allowComments,
        ownerName: idea.ownerName,
        ownerEmail: idea.ownerEmail,
        updatedAtLabel: idea.updatedAt.toLocaleDateString(),
      }))}
      initialLogs={recentLogs.map((log) => ({
        id: log.id,
        action: log.action,
        note: log.note,
        createdAtLabel: log.createdAt.toLocaleDateString(),
        label: log.label ?? "Idea removed",
      }))}
      initialStats={{
        totalIdeas: ideaStats.totalIdeas,
        publicIdeas: ideaStats.publicIdeas,
        revisionIdeas: ideaStats.revisionIdeas,
      }}
      filters={{
        query,
        visibilityFilter,
        statusFilter,
      }}
      pagination={{
        page,
        totalPages,
      }}
    />
  );
}
