import { ProjectTaskDetailPage } from "@/features/workspace/components/project-task-detail-page";

type PageProps = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

export default async function DashboardProjectTaskDetailRoute({ params }: PageProps) {
  const { id, taskId } = await params;

  return <ProjectTaskDetailPage projectId={id} taskId={taskId} />;
}
