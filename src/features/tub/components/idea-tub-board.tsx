"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tubTaskStatuses, type TubTaskStatus } from "@/lib/tub";
import { cn } from "@/lib/utils";

import { statusMeta } from "./idea-tub-types";
import { formatDateLabel } from "./idea-tub-utils";

type IdeaTubBoardProps = {
  draggedTaskId: string | null;
  hasSelectedDate: boolean;
  moveTask: (taskId: string, status: TubTaskStatus) => void;
  removeTask: (taskId: string) => void;
  selectedDate: string | null;
  setDraggedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  tasksByStatus: Record<TubTaskStatus, Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    deadline: string | null;
    status: TubTaskStatus;
    image: string | null;
    updatedAt: string;
  }>>;
};

export function IdeaTubBoard({
  draggedTaskId,
  hasSelectedDate,
  moveTask,
  removeTask,
  selectedDate,
  setDraggedTaskId,
  tasksByStatus,
}: IdeaTubBoardProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | TubTaskStatus>("all");

  const dayTasks = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return tubTaskStatuses
      .flatMap((status) => tasksByStatus[status])
      .filter((task) => task.date === selectedDate);
  }, [selectedDate, tasksByStatus]);

  const listTasks = useMemo(() => {
    return dayTasks.filter((task) => {
      return statusFilter === "all" || task.status === statusFilter;
    });
  }, [dayTasks, statusFilter]);

  return (
    <section className="grid gap-4">
      {hasSelectedDate && selectedDate ? (
        <Card className="border-border bg-card/92 shadow-xl backdrop-blur">
          <CardHeader className="gap-3 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge variant="outline" className="w-fit font-mono">
                  Task manager
                </Badge>
                <CardTitle className="mt-3 text-2xl">{formatDateLabel(selectedDate)}</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "all" | TubTaskStatus)}
                >
                  <SelectTrigger className="h-10 w-[160px] bg-background/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {tubTaskStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusMeta[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
            <div className="grid gap-3">
              {listTasks.length === 0 ? (
                <div className="border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
                  No tasks match the current filters for this date.
                </div>
              ) : (
                listTasks.map((task) => (
                  <TaskSurface
                    key={task.id}
                    task={task}
                    draggedTaskId={draggedTaskId}
                    moveTask={moveTask}
                    removeTask={removeTask}
                    setDraggedTaskId={setDraggedTaskId}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card/92 shadow-sm">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Select a date from the calendar above to open the task manager.
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function TaskSurface({
  task,
  draggedTaskId,
  moveTask,
  removeTask,
  setDraggedTaskId,
}: {
  task: {
    id: string;
    title: string;
    description: string;
    date: string;
    deadline: string | null;
    status: TubTaskStatus;
    image: string | null;
    updatedAt: string;
  };
  draggedTaskId: string | null;
  moveTask: (taskId: string, status: TubTaskStatus) => void;
  removeTask: (taskId: string) => void;
  setDraggedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const StatusIcon = statusMeta[task.status].icon;

  return (
    <article
      draggable
      onDragStart={() => setDraggedTaskId(task.id)}
      onDragEnd={() => setDraggedTaskId(null)}
      className={cn(
        "grid gap-3 border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/35",
        draggedTaskId === task.id && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-border bg-background/70">
            <StatusIcon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">{task.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <span>{formatDateLabel(task.date)}</span>
              {task.deadline ? <span>due {formatDateLabel(task.deadline)}</span> : null}
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => removeTask(task.id)}
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {task.description ? (
        <p className="text-sm leading-6 text-muted-foreground">{task.description}</p>
      ) : null}

      {task.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={task.image}
          alt={`${task.title} reference`}
          className="h-32 w-full border border-border object-cover"
        />
      ) : null}

      <Select
        value={task.status}
        onValueChange={(value) => moveTask(task.id, value as TubTaskStatus)}
      >
        <SelectTrigger className="h-10 bg-background/70">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tubTaskStatuses.map((option) => (
            <SelectItem key={option} value={option}>
              {statusMeta[option].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </article>
  );
}
