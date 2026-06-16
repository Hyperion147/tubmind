import type { TubTask, TubTaskStatus } from "@/lib/tub";

export type IdeaStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "published"
  | "needs_revision"
  | "archived";

export type IdeaVisibility = "private" | "public" | "hidden";

export type WorkspaceTask = TubTask & {
  ideaId: string;
  ideaSlug: string;
  ideaTitle: string;
  ideaStatus: IdeaStatus;
  ideaVisibility: IdeaVisibility;
};

export type WorkspaceIdea = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: IdeaStatus;
  visibility: IdeaVisibility;
  updatedAt: string;
  createdAt: string;
  timeline: string | null;
  spaceType: string | null;
  problem: string | null;
  targetAudience: string | null;
  comments: number;
  likes: number;
  tasks: WorkspaceTask[];
};

export type WorkspaceDashboardData = {
  ideas: WorkspaceIdea[];
  tasks: WorkspaceTask[];
  stats: {
    totalIdeas: number;
    publicIdeas: number;
    totalTasks: number;
    completedTasks: number;
    sharedTasks: number;
    dueSoonTasks: number;
  };
};

export function groupTasksByStatus(tasks: WorkspaceTask[]) {
  return tasks.reduce<Record<TubTaskStatus, WorkspaceTask[]>>(
    (result, task) => {
      result[task.status].push(task);
      return result;
    },
    {
      planned: [],
      ongoing: [],
      shared: [],
      completed: [],
    },
  );
}

export function getTaskById(tasks: WorkspaceTask[], taskId: string) {
  return tasks.find((task) => task.id === taskId) ?? null;
}

export function getProjectTaskHref(task: Pick<WorkspaceTask, "id" | "ideaId">) {
  return `/dashboard/projects/${task.ideaId}/tasks/${task.id}`;
}
