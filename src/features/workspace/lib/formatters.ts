import type { WorkspaceTask } from "./workspace-model";

export function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export function formatShortDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeBucket(task: WorkspaceTask) {
  const reference = task.deadline ?? task.date;
  const target = new Date(reference);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((targetStart.getTime() - start.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return "Overdue";
  }

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Tomorrow";
  }

  if (diffDays <= 7) {
    return "This week";
  }

  return "Later";
}

export function isTaskOverdue(task: WorkspaceTask) {
  if (!task.deadline || task.status === "completed") {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return new Date(task.deadline) < today;
}
