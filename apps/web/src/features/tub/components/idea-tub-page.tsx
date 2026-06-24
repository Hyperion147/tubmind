"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { IdeaTubBoard } from "./idea-tub-board";
import { IdeaTubOverview } from "./idea-tub-overview";
import { IdeaTubTaskForm } from "./idea-tub-task-form";
import type { IdeaTubPageProps } from "./idea-tub-types";
import { useIdeaTubState } from "./use-idea-tub-state";

export function IdeaTubPage(props: IdeaTubPageProps) {
  const tub = useIdeaTubState(props);
  const statusSummary = {
    planned: tub.tasksByStatus.planned.length,
    ongoing: tub.tasksByStatus.ongoing.length,
    shared: tub.tasksByStatus.shared.length,
    completed: tub.tasksByStatus.completed.length,
  };

  return (
    <main className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <IdeaTubOverview
          calendarDays={tub.calendarDays}
          monthLabel={tub.monthLabel}
          selectedDate={tub.selectedDate}
          selectedDayCount={tub.selectedDayCount}
          setSelectedDate={tub.setSelectedDate}
          shiftMonth={tub.shiftMonth}
          statusSummary={statusSummary}
          taskCountByDate={tub.taskCountByDate}
          taskCount={tub.tasks.length}
          updatedAt={tub.idea.updatedAt}
        />
        <IdeaTubTaskForm
          addTask={tub.addTask}
          draft={tub.draft}
          errorMessage={tub.errorMessage}
          handleImageChange={tub.handleImageChange}
          ideaId={tub.idea.id}
          isDeadlinePickerOpen={tub.isDeadlinePickerOpen}
          mutationError={tub.mutation.error?.message}
          mutationSuccess={tub.mutation.isSuccess}
          selectedDate={tub.selectedDate}
          setDraft={tub.setDraft}
          setIsDeadlinePickerOpen={tub.setIsDeadlinePickerOpen}
        />
      </section>

      <IdeaTubBoard
        draggedTaskId={tub.draggedTaskId}
        hasSelectedDate={tub.hasSelectedDate}
        moveTask={tub.moveTask}
        removeTask={tub.removeTask}
        selectedDate={tub.selectedDate}
        setDraggedTaskId={tub.setDraggedTaskId}
        tasksByStatus={tub.tasksByStatus}
        updateTask={tub.updateTask}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground">
        <p>
          {tub.isPending || tub.mutation.isPending
            ? "Saving latest tub change..."
            : tub.mutation.isError
              ? "Last save failed. The task list was restored."
              : tub.lastSavedAt
                ? `Saved ${formatSaveTime(tub.lastSavedAt)}.`
                : "Auto-saves happen whenever the tub changes."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="ghost">
            <Link href="/dashboard/tubs">Back to tubs</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/ideas/${tub.idea.slug}`}>Public preview</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function formatSaveTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
