"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { TaskTableRow } from "./task-table-row";
import type { SetSearchParams, SortValue } from "./tasks-page-types";
import { perPageOptions } from "./tasks-page-types";
import type { WorkspaceTask } from "../lib/workspace-model";

type TasksListViewProps = {
    endIndex: number;
    pagedTasks: WorkspaceTask[];
    perPage: number;
    safePage: number;
    setSearchParams: SetSearchParams;
    sort: SortValue;
    sortedTaskCount: number;
    startIndex: number;
    taskCountLabel: string;
    totalPages: number;
};

export function TasksListView({
    endIndex,
    pagedTasks,
    perPage,
    safePage,
    setSearchParams,
    sort,
    sortedTaskCount,
    startIndex,
    taskCountLabel,
    totalPages,
}: TasksListViewProps) {
    return (
        <Card className="border border-border bg-card/92 shadow-sm">
            <CardHeader className="border-b">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-semibold text-foreground">
                            {taskCountLabel}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            A table-style pass over every matching task.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select
                            value={sort}
                            onValueChange={(value) => {
                                const nextValue = value as SortValue;
                                setSearchParams({
                                    sort:
                                        nextValue === "task-date-desc"
                                            ? null
                                            : nextValue,
                                    page: null,
                                });
                            }}
                        >
                            <SelectTrigger className="h-11 min-w-[15rem] rounded-none bg-background">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="task-date-desc">
                                    Sort: Task date (newest)
                                </SelectItem>
                                <SelectItem value="task-date-asc">
                                    Sort: Task date (oldest)
                                </SelectItem>
                                <SelectItem value="deadline-asc">
                                    Sort: Deadline (soonest)
                                </SelectItem>
                                <SelectItem value="updated-desc">
                                    Sort: Updated (newest)
                                </SelectItem>
                                <SelectItem value="title-asc">
                                    Sort: Title (A-Z)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="w-full">
                <div className="hidden grid-cols-[1.85fr_0.7fr_0.65fr_0.62fr_0.62fr_0.62fr] border-b border-border pb-2 text-sm font-medium text-muted-foreground xl:grid">
                    <span className="pl-5">Task</span>
                    <span>Idea</span>
                    <span>Status</span>
                    <span>Task date</span>
                    <span>Deadline</span>
                    <span>Updated</span>
                </div>

                <div className="grid">
                    {pagedTasks.map((task) => (
                        <TaskTableRow key={task.id} task={task} />
                    ))}
                </div>

                <div className="flex flex-col gap-4 border-t border-border px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                        <span>Show</span>
                        <Select
                            value={String(perPage)}
                            onValueChange={(value) => {
                                setSearchParams({
                                    perPage: value === "10" ? null : value,
                                    page: null,
                                });
                            }}
                        >
                            <SelectTrigger className="h-10 min-w-[6.5rem] rounded-none bg-background">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                {perPageOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span>per page</span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {startIndex} - {endIndex} of {sortedTaskCount} tasks
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="fill2"
                            size="icon-sm"
                            className="rounded-none"
                            disabled={safePage === 1}
                            onClick={() => {
                                const nextPage = Math.max(1, safePage - 1);
                                setSearchParams({
                                    page:
                                        nextPage === 1
                                            ? null
                                            : String(nextPage),
                                });
                            }}
                        >
                            <span className="sr-only">Previous page</span>
                            <ChevronDown className="size-4 rotate-90" />
                        </Button>
                        <div className="flex size-8 items-center justify-center border border-primary bg-background text-sm text-primary">
                            {safePage}
                        </div>
                        <Button
                            type="button"
                            variant="fill2"
                            size="icon-sm"
                            className="rounded-none"
                            disabled={safePage === totalPages}
                            onClick={() => {
                                const nextPage = Math.min(
                                    totalPages,
                                    safePage + 1,
                                );
                                setSearchParams({
                                    page:
                                        nextPage === 1
                                            ? null
                                            : String(nextPage),
                                });
                            }}
                        >
                            <span className="sr-only">Next page</span>
                            <ChevronDown className="size-4 -rotate-90" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
