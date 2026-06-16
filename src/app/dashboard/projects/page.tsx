import { getCurrentSession } from "@/lib/auth";
import { ProjectsPageClient } from "@/features/workspace/components/projects-page-client";
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    view?: string;
    idea?: string;
  }>;
};

export default async function DashboardProjectsPage({ searchParams }: PageProps) {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const params = await searchParams;
  const workspace = await getDashboardWorkspace(session.profile.id);
  const view = params.view === "tasks" ? "tasks" : "projects";
  const query = params.q?.trim() ?? "";
  const selectedIdeaId =
    params.idea && workspace.ideas.some((idea) => idea.id === params.idea)
      ? params.idea
      : "all";

  return (
    <ProjectsPageClient
      ideas={workspace.ideas}
      initialFilters={{
        query,
        view,
        selectedIdeaId,
      }}
    />
  );
}
