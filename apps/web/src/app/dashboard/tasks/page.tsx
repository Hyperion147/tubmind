import { getCurrentSession } from "@/lib/auth";
import { TasksPageClient } from "@/features/workspace/components/tasks-page-client";
import { getDashboardWorkspace } from "@/features/workspace/server/get-dashboard-workspace";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    view?: string;
    sort?: string;
    perPage?: string;
    page?: string;
  }>;
};

export default async function DashboardTasksPage({ searchParams }: PageProps) {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const params = await searchParams;
  const workspace = await getDashboardWorkspace(session.profile.id);
  const view = params.view === "board" ? "board" : "list";
  const sort =
    params.sort === "task-date-asc" ||
    params.sort === "deadline-asc" ||
    params.sort === "updated-desc" ||
    params.sort === "title-asc" ||
    params.sort === "task-date-desc"
      ? params.sort
      : "task-date-desc";
  const perPage =
    params.perPage === "10" || params.perPage === "20" || params.perPage === "50"
      ? Number(params.perPage)
      : 10;
  const page = Math.max(Number(params.page ?? "1") || 1, 1);

  return (
    <TasksPageClient
      tasks={workspace.tasks}
      initialFilters={{
        query: params.q?.trim() ?? "",
        view,
        sort,
        perPage,
        page,
      }}
    />
  );
}
