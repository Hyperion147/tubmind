import { getCurrentSession } from "@/lib/auth";
import { ProjectsPageClient } from "@/features/workspace/components/projects-page-client";
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";

export default async function DashboardProjectsPage() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const workspace = await getDashboardWorkspace(session.profile.id);

  return <ProjectsPageClient ideas={workspace.ideas} />;
}
