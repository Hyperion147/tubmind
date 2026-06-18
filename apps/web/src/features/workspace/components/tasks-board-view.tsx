import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusMeta } from "@/features/tub/components/idea-tub-types";
import { cn } from "@/lib/utils";

import { formatShortDate, isTaskOverdue } from "../lib/formatters";
import { getTaskHref, type WorkspaceTask } from "../lib/workspace-model";
import type { TasksByStatus } from "./tasks-page-types";

const statAccent = {
    planned: {
        tone: "text-primary",
        soft: "bg-[color-mix(in_oklch,var(--primary)_12%,white)]",
    },
    ongoing: {
        tone: "text-[oklch(0.58_0.17_260)]",
        soft: "bg-[oklch(0.95_0.03_260)]",
    },
    shared: {
        tone: "text-[oklch(0.72_0.16_65)]",
        soft: "bg-[oklch(0.97_0.03_65)]",
    },
    completed: {
        tone: "text-[oklch(0.52_0.1_152)]",
        soft: "bg-[color-mix(in_oklch,var(--primary)_12%,white)]",
    },
} as const;

const columns = ["planned", "ongoing", "shared", "completed"] as const;

export function TasksBoardView({
    boardGrouped,
}: {
    boardGrouped: TasksByStatus;
}) {
    return (
        <section className="grid gap-4 xl:grid-cols-4">
            {columns.map((column) => (
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
                                        const Icon = statusMeta[column].icon;
                                        return <Icon className="size-5" />;
                                    })()}
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-foreground">
                                        {statusMeta[column].label}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {boardGrouped[column].length} tasks
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
                                <TaskBoardCard key={task.id} task={task} />
                            ))
                        )}
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

function TaskBoardCard({ task }: { task: WorkspaceTask }) {
    return (
        <Link
            href={getTaskHref(task)}
            className="grid gap-3 border border-border bg-background/72 p-4 transition-colors hover:border-primary/35 hover:bg-secondary/35"
        >
            <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono">
                    {task.ideaTitle}
                </Badge>
                {isTaskOverdue(task) ? (
                    <Badge variant="destructive" className="font-mono">
                        Overdue
                    </Badge>
                ) : null}
            </div>
            <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                    {task.title}
                </p>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {task.description || "No extra notes yet."}
                </p>
            </div>
            <div className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <span>Task date {formatShortDate(task.date)}</span>
                <span>Deadline {formatShortDate(task.deadline)}</span>
            </div>
        </Link>
    );
}
