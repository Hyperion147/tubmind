import type { WorkspaceTask } from "../lib/workspace-model";

export type SortValue =
    | "task-date-desc"
    | "task-date-asc"
    | "deadline-asc"
    | "updated-desc"
    | "title-asc";

export type ViewMode = "list" | "board";

export type TasksPageFilters = {
    query: string;
    view: ViewMode;
    sort: SortValue;
    perPage: number;
    page: number;
};

export type SetSearchParams = (
    updates: Record<string, string | null | undefined>,
    scroll?: boolean,
) => void;

export type TasksByStatus = Record<WorkspaceTask["status"], WorkspaceTask[]>;

export const perPageOptions = ["10", "20", "50"] as const;
