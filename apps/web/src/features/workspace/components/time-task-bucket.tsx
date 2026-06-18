import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { formatShortDate } from "../lib/formatters";
import { getTaskHref, type WorkspaceTask } from "../lib/workspace-model";

export function TaskBucket({
  title,
  description,
  tasks,
  destructive = false,
}: {
  title: string;
  description: string;
  tasks: WorkspaceTask[];
  destructive?: boolean;
}) {
  return (
    <div className="grid gap-2 border border-border bg-background/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-sm font-semibold", destructive ? "text-destructive" : "text-foreground")}>
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant={destructive ? "destructive" : "secondary"} className="font-mono">
          {tasks.length}
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <div className="border border-dashed border-border bg-card/60 p-3 text-sm text-muted-foreground">
          Nothing here right now.
        </div>
      ) : (
        tasks.slice(0, 3).map((task) => (
          <Link
            key={task.id}
            href={getTaskHref(task)}
            className="grid gap-2 border border-border bg-card p-3 transition-colors hover:border-primary/35 hover:bg-background"
          >
            <p className="text-sm font-semibold text-foreground">{task.title}</p>
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <span>{task.ideaTitle}</span>
              <span>{task.deadline ? formatShortDate(task.deadline) : formatShortDate(task.date)}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
