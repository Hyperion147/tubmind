import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { timeLogs } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { TimeManagerPage } from "@/features/workspace/components/time-manager-page";
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";

export default async function DashboardTimePage() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

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
        projectId: log.ideaId,
        projectTitle: workspace.ideas.find((idea) => idea.id === log.ideaId)?.title ?? "Untitled project",
        startedAt: log.startedAt.toISOString(),
        endedAt: log.endedAt.toISOString(),
        durationMs: log.durationSeconds * 1000,
        notes: log.notes ?? "",
      }))}
    />
  );
}
