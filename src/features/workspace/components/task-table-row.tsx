import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { formatShortDate, humanize, isTaskOverdue } from "../lib/formatters";
import { getTaskHref, type WorkspaceTask } from "../lib/workspace-model";

export function TaskTableRow({ task }: { task: WorkspaceTask }) {
    return (
        <Link
            href={getTaskHref(task)}
            className="grid min-w-0 gap-4 overflow-hidden border-b border-x p-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,0.7fr)_minmax(0,0.65fr)_minmax(0,0.62fr)_minmax(0,0.62fr)_minmax(0,0.62fr)] xl:items-center"
        >
            <div className="flex min-w-0 gap-4 overflow-hidden">
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

            <div className="flex min-w-0 items-center xl:justify-start">
                <Badge variant="outline" className="max-w-full truncate font-mono">
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
        <div className="grid min-w-0 gap-1 text-sm">
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground xl:hidden">
                {label}
            </span>
            <div
                className={cn(
                    "inline-flex min-w-0 items-center gap-2 text-foreground",
                    destructive && "text-destructive",
                )}
            >
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{value}</span>
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
