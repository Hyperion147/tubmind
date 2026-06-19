"use client";

import { useMemo, useState, useTransition, type ChangeEvent, type DragEvent } from "react";

import {
  emptyIdeaTubData,
  tubTaskStatuses,
  type TubTask,
  type TubTaskStatus,
} from "@tubmind/domain/tub";
import { useUpdateTubTasks } from "@/features/tub/hooks/use-update-tub-tasks";

import type { IdeaTubPageProps } from "./idea-tub-types";
import {
  createCalendarDays,
  createEmptyDraft,
  compareTasks,
  getTodayDateValue,
  parseDateValue,
  readImageFile,
} from "./idea-tub-utils";

export function useIdeaTubState({ idea, initialTubData }: IdeaTubPageProps) {
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTubData.tasks);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const initialDate = initialTubData.tasks[0]?.date;
    return initialDate && parseDateValue(initialDate) ? initialDate : null;
  });
  const [draft, setDraft] = useState(createEmptyDraft());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeadlinePickerOpen, setIsDeadlinePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const seedDate = initialTubData.tasks[0]?.date ?? getTodayDateValue();
    return parseDateValue(seedDate) ?? parseDateValue(getTodayDateValue()) ?? new Date();
  });

  const mutation = useUpdateTubTasks({
    ideaId: idea.id,
  });

  const taskCountByDate = useMemo(() => {
    const next = new Map<string, number>();

    for (const task of tasks) {
      next.set(task.date, (next.get(task.date) ?? 0) + 1);
    }

    return next;
  }, [tasks]);

  const tasksByStatus = useMemo(() => {
    return tubTaskStatuses.reduce(
      (result, status) => {
        result[status] = tasks.filter((task) => task.status === status).sort(compareTasks);
        return result;
      },
      {} as Record<TubTaskStatus, TubTask[]>,
    );
  }, [tasks]);

  const calendarDays = useMemo(() => createCalendarDays(calendarMonth), [calendarMonth]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(calendarMonth),
    [calendarMonth],
  );

  const selectedDayCount = selectedDate ? (taskCountByDate.get(selectedDate) ?? 0) : 0;
  const hasSelectedDate = selectedDate !== null;

  function persistTasks(nextTasks: TubTask[]) {
    const normalized = nextTasks
      .map((task) => ({
        ...task,
        description: task.description.trim(),
      }))
      .sort(compareTasks);

    setErrorMessage(null);
    startTransition(() => {
      setTasks(normalized);
    });
    mutation.mutate({
      ...emptyIdeaTubData,
      tasks: normalized,
    });
  }

  function addTask() {
    if (!selectedDate) {
      setErrorMessage("Choose a date first.");
      return;
    }

    if (!draft.title.trim()) {
      setErrorMessage("A task title will help keep this tub organized.");
      return;
    }

    const now = new Date().toISOString();
    const nextTask: TubTask = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      date: selectedDate,
      deadline: draft.deadline,
      status: draft.status,
      image: draft.image,
      updatedAt: now,
    };

    persistTasks([nextTask, ...tasks]);
    setDraft(createEmptyDraft());
    setIsDeadlinePickerOpen(false);
  }

  function removeTask(taskId: string) {
    persistTasks(tasks.filter((task) => task.id !== taskId));
  }

  function updateTask(taskId: string, values: Omit<TubTask, "id" | "updatedAt">) {
    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...values,
              title: values.title.trim(),
              description: values.description.trim(),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  function moveTask(taskId: string, status: TubTaskStatus) {
    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  function shiftMonth(direction: -1 | 1) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    try {
      const image = await readImageFile(event);
      setDraft((current) => ({ ...current, image }));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not add this image.");
    } finally {
      event.target.value = "";
    }
  }

  function handleDrop(nextStatus: TubTaskStatus, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!draggedTaskId) {
      return;
    }

    moveTask(draggedTaskId, nextStatus);
    setDraggedTaskId(null);
  }

  return {
    addTask,
    calendarDays,
    draft,
    errorMessage,
    handleDrop,
    handleImageChange,
    hasSelectedDate,
    idea,
    isDeadlinePickerOpen,
    isPending,
    monthLabel,
    mutation,
    removeTask,
    updateTask,
    selectedDate,
    selectedDayCount,
    setDraft,
    setDraggedTaskId,
    setIsDeadlinePickerOpen,
    setSelectedDate,
    shiftMonth,
    taskCountByDate,
    tasks,
    tasksByStatus,
    draggedTaskId,
    moveTask,
  };
}
