import { Suspense } from "react";
import { and, count, desc, eq, ilike, isNotNull, or } from "drizzle-orm";

import { db } from "@/db";
import { ideaComments, ideas, moderationLogs, profiles } from "@/db/schema";
import { AdminPageSkeleton } from "@/features/admin/components/admin-page-skeleton";
import { AdminCommentsPageClient } from "@/features/admin/components/admin-comments-page-client";

type PageProps = {
  searchParams: Promise<{
    commentQ?: string;
    commentStatus?: string;
  }>;
};

export default function AdminCommentsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminCommentsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminCommentsContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const commentQuery = params.commentQ?.trim() ?? "";
  const commentStatusFilter =
    params.commentStatus === "visible" ||
    params.commentStatus === "hidden" ||
    params.commentStatus === "deleted"
      ? params.commentStatus
      : "all";

  const commentFilters = [
    ...(commentQuery
      ? [
          or(
            ilike(ideaComments.body, `%${commentQuery}%`),
            ilike(profiles.displayName, `%${commentQuery}%`),
            ilike(ideas.title, `%${commentQuery}%`)
          )!,
        ]
      : []),
    ...(commentStatusFilter !== "all" ? [eq(ideaComments.status, commentStatusFilter)] : []),
  ];

  const [comments, totalCommentsResult, hiddenCommentsResult, deletedCommentsResult, recentLogs] =
    await Promise.all([
      db
        .select({
          id: ideaComments.id,
          body: ideaComments.body,
          status: ideaComments.status,
          ideaId: ideas.id,
          ideaSlug: ideas.slug,
          ideaTitle: ideas.title,
          ideaVisibility: ideas.visibility,
          authorName: profiles.displayName,
          authorEmail: profiles.email,
          updatedAt: ideaComments.updatedAt,
        })
        .from(ideaComments)
        .innerJoin(ideas, eq(ideaComments.ideaId, ideas.id))
        .innerJoin(profiles, eq(ideaComments.authorId, profiles.id))
        .where(commentFilters.length ? and(...commentFilters) : undefined)
        .orderBy(desc(ideaComments.updatedAt))
        .limit(30),
      db.select({ value: count() }).from(ideaComments),
      db.select({ value: count() }).from(ideaComments).where(eq(ideaComments.status, "hidden")),
      db.select({ value: count() }).from(ideaComments).where(eq(ideaComments.status, "deleted")),
      db
        .select({
          id: moderationLogs.id,
          action: moderationLogs.action,
          note: moderationLogs.note,
          createdAt: moderationLogs.createdAt,
          label: ideaComments.body,
        })
        .from(moderationLogs)
        .innerJoin(ideaComments, eq(moderationLogs.targetCommentId, ideaComments.id))
        .where(isNotNull(moderationLogs.targetCommentId))
        .orderBy(desc(moderationLogs.createdAt))
        .limit(8),
    ]);

  return (
    <AdminCommentsPageClient
      initialComments={comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        status: comment.status,
        ideaId: comment.ideaId,
        ideaSlug: comment.ideaSlug,
        ideaTitle: comment.ideaTitle,
        ideaVisibility: comment.ideaVisibility === "public" ? "public" : "private",
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        updatedAtLabel: comment.updatedAt.toLocaleDateString(),
      }))}
      initialLogs={recentLogs.map((log) => ({
        id: log.id,
        action: log.action,
        note: log.note,
        createdAtLabel: log.createdAt.toLocaleDateString(),
        label: log.label.slice(0, 72) || "Comment removed",
      }))}
      initialStats={{
        totalComments: totalCommentsResult[0]?.value ?? 0,
        hiddenComments: hiddenCommentsResult[0]?.value ?? 0,
        deletedComments: deletedCommentsResult[0]?.value ?? 0,
      }}
      filters={{
        commentQuery,
        commentStatusFilter,
      }}
    />
  );
}
