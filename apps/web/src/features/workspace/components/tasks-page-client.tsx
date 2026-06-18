"use client";

import { useMemo } from "react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { useUrlSearchState } from "@/hooks/use-url-search-state";

import {
    groupTasksByStatus,
    type WorkspaceTask,
} from "../lib/workspace-model";
import { TasksBoardView } from "./tasks-board-view";
import { TasksEmptyState } from "./tasks-empty-state";
import { TasksListView } from "./tasks-list-view";
import { TasksPageHeader } from "./tasks-page-header";
import {
    perPageOptions,
    type SortValue,
    type TasksPageFilters,
} from "./tasks-page-types";
import { compareNullableDate, isSortValue } from "./tasks-page-utils";

type TasksPageClientProps = {
    tasks: WorkspaceTask[];
    initialFilters: TasksPageFilters;
};

export function TasksPageClient({
    tasks,
    initialFilters,
}: TasksPageClientProps) {
    const { isPending, searchParams, setSearchParams } = useUrlSearchState();
    const query = searchParams.get("q") ?? initialFilters.query;
    const view =
        searchParams.get("view") === "board" ? "board" : initialFilters.view;
    const sortParam = searchParams.get("sort");
    const sort: SortValue = isSortValue(sortParam)
        ? sortParam
        : initialFilters.sort;
    const perPageParam = searchParams.get("perPage");
    const perPage =
        perPageParam &&
        perPageOptions.includes(
            perPageParam as (typeof perPageOptions)[number],
        )
            ? Number(perPageParam)
            : initialFilters.perPage;
    const page = Math.max(
        Number(searchParams.get("page") ?? initialFilters.page) || 1,
        1,
    );

    const filteredTasks = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return tasks.filter((task) => {
            return (
                normalizedQuery.length === 0 ||
                [task.title, task.description, task.ideaTitle]
                    .join(" ")
                    .toLowerCase()
                    .includes(normalizedQuery)
            );
        });
    }, [query, tasks]);

    const sortedTasks = useMemo(() => {
        const items = [...filteredTasks];

        items.sort((a, b) => {
            switch (sort) {
                case "task-date-asc":
                    return a.date.localeCompare(b.date);
                case "deadline-asc":
                    return (
                        compareNullableDate(a.deadline, b.deadline) ||
                        a.date.localeCompare(b.date)
                    );
                case "updated-desc":
                    return (
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                    );
                case "title-asc":
                    return a.title.localeCompare(b.title);
                case "task-date-desc":
                default:
                    return b.date.localeCompare(a.date);
            }
        });

        return items;
    }, [filteredTasks, sort]);

    const boardGrouped = useMemo(
        () => groupTasksByStatus(sortedTasks),
        [sortedTasks],
    );

    const totalPages = Math.max(1, Math.ceil(sortedTasks.length / perPage));
    const safePage = Math.min(page, totalPages);
    const pagedTasks = useMemo(() => {
        const start = (safePage - 1) * perPage;
        return sortedTasks.slice(start, start + perPage);
    }, [perPage, safePage, sortedTasks]);

    const startIndex =
        sortedTasks.length === 0 ? 0 : (safePage - 1) * perPage + 1;
    const endIndex = Math.min(sortedTasks.length, safePage * perPage);
    const taskCountLabel = `${sortedTasks.length} ${
        sortedTasks.length === 1 ? "task" : "tasks"
    }`;

    return (
        <div className="grid gap-4">
            <SiteBreadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Tasks" },
                ]}
            />

            <TasksPageHeader
                isPending={isPending}
                query={query}
                setSearchParams={setSearchParams}
                view={view}
            />

            {sortedTasks.length === 0 ? (
                <TasksEmptyState />
            ) : view === "list" ? (
                <TasksListView
                    endIndex={endIndex}
                    pagedTasks={pagedTasks}
                    perPage={perPage}
                    safePage={safePage}
                    setSearchParams={setSearchParams}
                    sort={sort}
                    sortedTaskCount={sortedTasks.length}
                    startIndex={startIndex}
                    taskCountLabel={taskCountLabel}
                    totalPages={totalPages}
                />
            ) : (
                <TasksBoardView boardGrouped={boardGrouped} />
            )}
        </div>
    );
}
