import type { TubTask, TubTaskStatus } from "@tubmind/domain/tub";
import type {
  IdeaStatus,
  IdeaVisibility,
} from "@tubmind/contracts/idea";

export type { IdeaStatus, IdeaVisibility };

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

export function getTaskHref(task: Pick<WorkspaceTask, "id">) {
  return `/dashboard/tasks/${encodeURIComponent(task.id)}`;
}

export function getTubWorkflowState(idea: WorkspaceIdea) {
  const hasTasks = idea.tasks.length > 0;
  const hasOverdueTasks = idea.tasks.some((task) => {
    if (!task.deadline || task.status === "completed") {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.deadline) < today;
  });
  const openTasks = idea.tasks.filter((task) => task.status !== "completed");

  if (hasOverdueTasks) {
    return {
      label: "Blocked",
      description: "Overdue task needs attention",
      tone: "destructive" as const,
    };
  }

  if (idea.status === "submitted") {
    return {
      label: "Ready to publish",
      description: "Review and publish when ready",
      tone: "ready" as const,
    };
  }

  if (idea.status === "published" || idea.visibility === "public") {
    return {
      label: idea.comments > 0 ? "Published with discussion" : "Published",
      description:
        idea.comments > 0 ? `${idea.comments} visible comments` : "Live on listings",
      tone: "published" as const,
    };
  }

  if (!hasTasks) {
    return {
      label: "No tasks yet",
      description: "Add first steps to start the tub",
      tone: "muted" as const,
    };
  }

  if (openTasks.length > 0) {
    return {
      label: "Active",
      description: `${openTasks.length} open ${openTasks.length === 1 ? "task" : "tasks"}`,
      tone: "active" as const,
    };
  }

  return {
    label: "Needs review",
    description: "All tasks are complete",
    tone: "ready" as const,
  };
}
