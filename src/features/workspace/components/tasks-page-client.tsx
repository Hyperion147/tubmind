"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    FolderOpen,
    List as ListIcon,
    MoreHorizontal,
    Plus,
    Search,
    Share2,
    SquareKanban,
    Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { statusMeta } from "@/features/tub/components/idea-tub-types";

import { formatShortDate, humanize, isTaskOverdue } from "../lib/formatters";
import {
    getProjectTaskHref,
    groupTasksByStatus,
    type WorkspaceTask,
} from "../lib/workspace-model";

type TasksPageClientProps = {
    tasks: WorkspaceTask[];
};

const statusOptions = [
    "all",
    "planned",
    "ongoing",
    "shared",
    "completed",
] as const;
const perPageOptions = ["10", "20", "50"] as const;

type StatusFilter = (typeof statusOptions)[number];
type SortValue =
    | "task-date-desc"
    | "task-date-asc"
    | "deadline-asc"
    | "updated-desc"
    | "title-asc";
type ViewMode = "list" | "board";

const statAccent = {
    planned: {
        icon: Target,
        tone: "text-primary",
        soft: "bg-[color-mix(in_oklch,var(--primary)_12%,white)]",
    },
    ongoing: {
        icon: Clock3,
        tone: "text-[oklch(0.58_0.17_260)]",
        soft: "bg-[oklch(0.95_0.03_260)]",
    },
    shared: {
        icon: Share2,
        tone: "text-[oklch(0.72_0.16_65)]",
        soft: "bg-[oklch(0.97_0.03_65)]",
    },
    completed: {
        icon: CheckCircle2,
        tone: "text-[oklch(0.52_0.1_152)]",
        soft: "bg-[color-mix(in_oklch,var(--primary)_12%,white)]",
    },
} as const;

export function TasksPageClient({ tasks }: TasksPageClientProps) {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [view, setView] = useState<ViewMode>("list");
    const [sort, setSort] = useState<SortValue>("task-date-desc");
    const [perPage, setPerPage] = useState<number>(10);
    const [page, setPage] = useState(1);

    const filteredTasks = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesStatus = status === "all" || task.status === status;
            const matchesQuery =
                normalizedQuery.length === 0 ||
                [task.title, task.description, task.ideaTitle]
                    .join(" ")
                    .toLowerCase()
                    .includes(normalizedQuery);

            return matchesStatus && matchesQuery;
        });
    }, [query, status, tasks]);

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

    const groupedAll = useMemo(
        () => groupTasksByStatus(filteredTasks),
        [filteredTasks],
    );
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

    const taskCountLabel = `${sortedTasks.length} ${sortedTasks.length === 1 ? "task" : "tasks"}`;

    return (
        <div className="grid gap-4">
            <section className="grid gap-4 border border-border bg-card/90 shadow-sm p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                        <Badge variant="outline" className="w-fit font-mono">
                            Tasks
                        </Badge>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-semibold tracking-tight text-foreground xl:text-[3rem]">
                                Delivery board
                            </h1>
                        </div>
                    </div>

                    <div className="grid xl:min-w-[41rem] items-end-safe h-full">
                        <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                            <label className="relative">
                                <Search className="pointer-events-none absolute left-4 top-4.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search tasks or ideas"
                                    className="bg-background pl-11"
                                />
                            </label>
                            <Button
                                asChild
                                className="rounded-none px-4"
                                variant="fill"
                            >
                                <Link
                                    href="/dashboard/projects"
                                    className="gap-2"
                                >
                                    <Plus className="size-4" />
                                    <span>New task</span>
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                type="button"
                                onClick={() => setView("list")}
                                variant={view === "list" ? "fill" : "fill2"}
                            >
                                <ListIcon className="size-4" />
                                <span>List view</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setView("board")}
                                variant={view === "board" ? "fill" : "fill2"}
                            >
                                <SquareKanban className="size-4" />
                                <span>Board view</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
            
            {sortedTasks.length === 0 ? (
                <Card className="border border-border bg-card/92 shadow-sm">
                    <CardContent className="grid min-h-[18rem] place-items-center p-8 text-center">
                        <div className="space-y-4">
                            <div className="mx-auto flex size-16 items-center justify-center bg-secondary text-primary">
                                <Target className="size-7" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                                    No tasks match right now
                                </h2>
                                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                                    Adjust the search or status filter, or
                                    create new work from one of your idea tubs.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : view === "list" ? (
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
                                    onValueChange={(value) =>
                                        setSort(value as SortValue)
                                    }
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
                            <span>Project</span>
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
                                        setPerPage(Number(value));
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-10 min-w-[6.5rem] rounded-none bg-background">
                                        <SelectValue placeholder="Per page" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span>per page</span>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                {startIndex} - {endIndex} of {sortedTasks.length}{" "}
                                tasks
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="fill2"
                                    size="icon-sm"
                                    className="rounded-none"
                                    disabled={safePage === 1}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(1, current - 1),
                                        )
                                    }
                                >
                                    <span className="sr-only">
                                        Previous page
                                    </span>
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
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.min(totalPages, current + 1),
                                        )
                                    }
                                >
                                    <span className="sr-only">Next page</span>
                                    <ChevronDown className="size-4 -rotate-90" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <section className="grid gap-4 xl:grid-cols-4">
                    {(
                        ["planned", "ongoing", "shared", "completed"] as const
                    ).map((column) => (
                        <Card
                            key={column}
                            className="border border-border bg-card shadow-sm"
                        >
                            <CardHeader className="border-b border-border">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex size-10 items-center justify-center",
                                                statAccent[column].soft,
                                                statAccent[column].tone,
                                            )}
                                        >
                                            {(() => {
                                                const Icon =
                                                    statusMeta[column].icon;
                                                return (
                                                    <Icon className="size-5" />
                                                );
                                            })()}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-foreground">
                                                {statusMeta[column].label}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {boardGrouped[column].length}{" "}
                                                tasks
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {boardGrouped[column].length === 0 ? (
                                    <div className="border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
                                        Empty
                                    </div>
                                ) : (
                                    boardGrouped[column].map((task) => (
                                        <Link
                                            key={task.id}
                                            href={getProjectTaskHref(task)}
                                            className="grid gap-3 border border-border bg-background/72 p-4 transition-colors hover:border-primary/35 hover:bg-secondary/35"
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {task.ideaTitle}
                                                </Badge>
                                                {isTaskOverdue(task) ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="font-mono"
                                                    >
                                                        Overdue
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {task.title}
                                                </p>
                                                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                                                    {task.description ||
                                                        "No extra notes yet."}
                                                </p>
                                            </div>
                                            <div className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                                <span>
                                                    Task date{" "}
                                                    {formatShortDate(task.date)}
                                                </span>
                                                <span>
                                                    Deadline{" "}
                                                    {formatShortDate(
                                                        task.deadline,
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}
        </div>
    );
}

function TaskStatCard({
    status,
    count,
    total,
}: {
    status: keyof typeof statAccent;
    count: number;
    total: number;
}) {
    const { icon: Icon, tone, soft } = statAccent[status];
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardContent className="flex items-center gap-4">
                <div
                    className={cn(
                        "flex size-14 aspect-square items-center justify-center",
                        soft,
                        tone,
                    )}
                >
                    <Icon className="size-7" />
                </div>
                <div className="w-full">
                    <div className="flex w-full justify-between items-center">
                        <p className="text-xl font-semibold tracking-tight text-foreground">
                            {count}
                        </p>

                        <p className={cn("text-sm", tone)}>
                            {percentage}% of tasks
                        </p>
                    </div>
                    <p className="text-lg text-foreground">
                        {statusMeta[status].label}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function TaskTableRow({ task }: { task: WorkspaceTask }) {
    return (
        <Link
            href={getProjectTaskHref(task)}
            className="grid gap-4 border-b border-x p-5 xl:grid-cols-[1.85fr_0.7fr_0.65fr_0.62fr_0.62fr_0.62fr] xl:items-center"
        >
            <div className="flex gap-4">
                <div className="min-w-0 space-y-2">
                    <div className="space-y-1">
                        <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground xl:text-[1.9rem]">
                            {task.title}
                        </h2>
                        <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
                            {task.description ||
                                "No extra description saved for this task."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center xl:justify-start">
                <Badge variant="outline" className="font-mono">
                    {task.ideaTitle}
                </Badge>
            </div>

            <div className="flex items-center">
                <StatusTag task={task} />
            </div>

            <DateCell label="Task date" value={formatShortDate(task.date)} />
            <DateCell
                label="Deadline"
                value={formatShortDate(task.deadline)}
                destructive={isTaskOverdue(task)}
            />
            <DateCell label="Updated" value={formatShortDate(task.updatedAt)} />
        </Link>
    );
}

function DateCell({
    label,
    value,
    destructive = false,
}: {
    label: string;
    value: string;
    destructive?: boolean;
}) {
    return (
        <div className="grid gap-1 text-sm">
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground xl:hidden">
                {label}
            </span>
            <div
                className={cn(
                    "inline-flex items-center gap-2 text-foreground",
                    destructive && "text-destructive",
                )}
            >
                <CalendarDays className="size-4 text-muted-foreground" />
                <span>{value}</span>
            </div>
        </div>
    );
}

function StatusTag({ task }: { task: WorkspaceTask }) {
    const baseClass = isTaskOverdue(task)
        ? "border-destructive/20 bg-destructive/10 text-destructive"
        : task.status === "completed"
          ? "border-primary/20 bg-[color-mix(in_oklch,var(--primary)_12%,white)] text-primary"
          : task.status === "ongoing"
            ? "border-[oklch(0.58_0.17_260/0.2)] bg-[oklch(0.95_0.03_260)] text-[oklch(0.58_0.17_260)]"
            : task.status === "shared"
              ? "border-[oklch(0.72_0.16_65/0.2)] bg-[oklch(0.97_0.03_65)] text-[oklch(0.72_0.16_65)]"
              : "border-primary/20 bg-[color-mix(in_oklch,var(--primary)_10%,white)] text-primary";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 border px-3 py-1.5 text-sm",
                baseClass,
            )}
        >
            <span className="size-2 rounded-full bg-current" />
            {isTaskOverdue(task) ? "Overdue" : humanize(task.status)}
        </span>
    );
}

function compareNullableDate(a: string | null, b: string | null) {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
}
