"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteAction } from "@/components/confirm-delete-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  tubTaskStatuses,
  type TubTask,
  type TubTaskStatus,
} from "@tubmind/domain/tub";
import { cn } from "@/lib/utils";
import { taskStatusMeta } from "@/features/workspace/lib/task-status";

import { formatDateLabel } from "./idea-tub-utils";

type IdeaTubBoardProps = {
  draggedTaskId: string | null;
  hasSelectedDate: boolean;
  moveTask: (taskId: string, status: TubTaskStatus) => void;
  removeTask: (taskId: string) => void;
  selectedDate: string | null;
  setDraggedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  tasksByStatus: Record<TubTaskStatus, TubTask[]>;
  updateTask: (taskId: string, values: Omit<TubTask, "id" | "updatedAt">) => void;
};

export function IdeaTubBoard({
  draggedTaskId,
  hasSelectedDate,
  moveTask,
  removeTask,
  selectedDate,
  setDraggedTaskId,
  tasksByStatus,
  updateTask,
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
                        {taskStatusMeta[status].label}
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
                    updateTask={updateTask}
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
  updateTask,
}: {
  task: TubTask;
  draggedTaskId: string | null;
  moveTask: (taskId: string, status: TubTaskStatus) => void;
  removeTask: (taskId: string) => void;
  setDraggedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  updateTask: (taskId: string, values: Omit<TubTask, "id" | "updatedAt">) => void;
}) {
  const StatusIcon = taskStatusMeta[task.status].icon;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Omit<TubTask, "id" | "updatedAt">>({
    title: task.title,
    description: task.description,
    date: task.date,
    deadline: task.deadline,
    status: task.status,
    image: task.image,
  });

  function resetDraft() {
    setDraft({
      title: task.title,
      description: task.description,
      date: task.date,
      deadline: task.deadline,
      status: task.status,
      image: task.image,
    });
  }

  return (
    <article
      draggable={!isEditing}
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
          onClick={() => {
            if (isEditing) {
              resetDraft();
              setIsEditing(false);
              return;
            }

            setIsEditing(true);
          }}
          aria-label={isEditing ? `Cancel editing ${task.title}` : `Edit ${task.title}`}
        >
          {isEditing ? <X className="size-4" /> : <Pencil className="size-4" />}
        </Button>
        <ConfirmDeleteAction
          title="Delete this task?"
          description="This removes the task from the tub. The change is saved after confirmation."
          actionLabel="Delete task"
          size="icon-sm"
          variant="ghost"
          onConfirm={() => {
            removeTask(task.id);
            toast.success("Task deleted");
          }}
          triggerAriaLabel={`Delete ${task.title}`}
        >
          <Trash2 className="size-4" />
        </ConfirmDeleteAction>
      </div>

      {isEditing ? (
        <div className="grid gap-3 border border-border bg-background/60 p-3">
          <Input
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            className="h-11 bg-card"
            placeholder="Task title"
          />
          <Textarea
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({ ...current, description: event.target.value }))
            }
            className="min-h-24 bg-card"
            placeholder="Task description"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              type="date"
              value={draft.date}
              onChange={(event) =>
                setDraft((current) => ({ ...current, date: event.target.value }))
              }
              className="h-10 bg-card"
            />
            <Input
              type="date"
              value={draft.deadline ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  deadline: event.target.value || null,
                }))
              }
              className="h-10 bg-card"
            />
            <Select
              value={draft.status}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  status: value as TubTaskStatus,
                }))
              }
            >
              <SelectTrigger className="h-10 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tubTaskStatuses.map((option) => (
                  <SelectItem key={option} value={option}>
                    {taskStatusMeta[option].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="justify-between"
            disabled={!draft.title.trim() || !draft.date}
            onClick={() => {
              updateTask(task.id, draft);
              setIsEditing(false);
            }}
          >
            Save task
            <Check className="size-4" />
          </Button>
        </div>
      ) : (
        <>
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
                  {taskStatusMeta[option].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </article>
  );
}
