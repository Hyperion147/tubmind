import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { timeLogs } from "@tubmind/database";
import { getCurrentSession } from "@/lib/auth";
import { TimeManagerPage } from "@/features/workspace/components/time-manager-page";
import { getDashboardWorkspace } from "@/features/workspace/server/get-dashboard-workspace";

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    task?: string;
  }>;
};

export default async function DashboardTimePage({ searchParams }: PageProps) {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const params = await searchParams;
  const [workspace, initialLogs] = await Promise.all([
    getDashboardWorkspace(session.profile.id),
    db
      .select()
      .from(timeLogs)
      .where(eq(timeLogs.ownerId, session.profile.id))
      .orderBy(desc(timeLogs.startedAt)),
  ]);

  return (
    <TimeManagerPage
      profileId={session.profile.id}
      workspace={workspace}
      initialLogs={initialLogs.map((log) => ({
        id: log.id,
        taskId: log.taskId,
        taskTitle: log.taskTitle,
        ideaId: log.ideaId,
        ideaTitle: workspace.ideas.find((idea) => idea.id === log.ideaId)?.title ?? "Untitled idea",
        startedAt: log.startedAt.toISOString(),
        endedAt: log.endedAt.toISOString(),
        durationMs: log.durationSeconds * 1000,
        notes: log.notes ?? "",
      }))}
      initialFilters={{
        timeTab:
          params.tab === "week" || params.tab === "all" ? params.tab : "today",
        selectedTaskId:
          params.task && workspace.tasks.some((task) => task.id === params.task)
            ? params.task
            : "",
      }}
    />
  );
}
