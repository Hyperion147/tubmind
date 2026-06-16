import { getCurrentSession } from "@/lib/auth";
import { TasksPageClient } from "@/features/workspace/components/tasks-page-client";
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";

export default async function DashboardTasksPage() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const workspace = await getDashboardWorkspace(session.profile.id);

  return <TasksPageClient tasks={workspace.tasks} />;
}
