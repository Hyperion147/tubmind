"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Pause,
  Play,
  Square,
  Target,
  Timer,
  Zap,
} from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUrlSearchState } from "@/hooks/use-url-search-state";

import { formatRelativeBucket, formatShortDate, isTaskOverdue } from "../lib/formatters";
import type { WorkspaceDashboardData } from "../lib/workspace-model";
import { SummaryMini, SummaryStat } from "./time-summary-cards";
import { TaskBucket } from "./time-task-bucket";
import type { ActiveTimerState, TimeLogEntry, TimeTab } from "./time-manager-types";
import {
  DAY_MS,
  formatDuration,
  formatSessionRange,
  getDayStart,
  getWeekStart,
  readStoredActiveTimer,
} from "./time-manager-utils";

type TimeManagerPageProps = {
  profileId: string;
  workspace: WorkspaceDashboardData;
  initialLogs: TimeLogEntry[];
  initialFilters: {
    timeTab: TimeTab;
    selectedTaskId: string;
  };
};

export function TimeManagerPage({
  profileId,
  workspace,
  initialLogs,
  initialFilters,
}: TimeManagerPageProps) {
  const { isPending: isRoutePending, searchParams, setSearchParams } = useUrlSearchState();
  const activeStorageKey = `tubmind.time-tracker.${profileId}.active`;
  const initialStorageState = useMemo(() => readStoredActiveTimer(activeStorageKey), [activeStorageKey]);
  const [notes, setNotes] = useState(initialStorageState.activeTimer?.notes ?? "");
  const [entries, setEntries] = useState<TimeLogEntry[]>(initialLogs);
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(initialStorageState.activeTimer);
  const [now, setNow] = useState(() => Date.now());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  const tasks = workspace.tasks;
  const selectedTaskId = activeTimer?.taskId ?? searchParams.get("task") ?? initialFilters.selectedTaskId;
  const timeTab =
    searchParams.get("tab") === "week" || searchParams.get("tab") === "all"
      ? (searchParams.get("tab") as TimeTab)
      : initialFilters.timeTab;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const activeTask = tasks.find((task) => task.id === activeTimer?.taskId) ?? null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!activeTimer) {
      window.localStorage.removeItem(activeStorageKey);
      return;
    }

    window.localStorage.setItem(activeStorageKey, JSON.stringify(activeTimer));
  }, [activeStorageKey, activeTimer]);

  useEffect(() => {
    if (!activeTimer?.isRunning) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeTimer]);

  const allEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });
  }, [entries]);

  const activeElapsedMs = activeTimer
    ? activeTimer.accumulatedMs +
      (activeTimer.isRunning ? Math.max(0, now - new Date(activeTimer.startedAt).getTime()) : 0)
    : 0;

  const todayEntries = useMemo(() => {
    const startOfToday = getDayStart(new Date());
    const endOfToday = startOfToday + DAY_MS;

    return allEntries.filter((entry) => {
      const startedAt = new Date(entry.startedAt).getTime();
      return startedAt >= startOfToday && startedAt < endOfToday;
    });
  }, [allEntries]);

  const weekEntries = useMemo(() => {
    const weekStart = getWeekStart(new Date());
    return allEntries.filter((entry) => new Date(entry.startedAt).getTime() >= weekStart);
  }, [allEntries]);

  const totalTimeToday = todayEntries.reduce((sum, entry) => sum + entry.durationMs, 0) + activeElapsedMs;
  const weeklyTotalMs = weekEntries.reduce((sum, entry) => sum + entry.durationMs, 0) + activeElapsedMs;
  const weeklyAverageMs = weeklyTotalMs / 7;
  const todayGoalProgress = Math.min((totalTimeToday / (8 * 60 * 60 * 1000)) * 100, 100);
  const dueTodayTasks = tasks.filter((task) => formatRelativeBucket(task) === "Today");
  const dueThisWeekTasks = tasks.filter((task) => {
    const bucket = formatRelativeBucket(task);
    return bucket === "Tomorrow" || bucket === "This week";
  });
  const overdueTasks = tasks.filter(isTaskOverdue);

  function startTimer() {
    if (!selectedTask) {
      return;
    }

    setSaveError(null);
    setActiveTimer({
      taskId: selectedTask.id,
      startedAt: new Date().toISOString(),
      accumulatedMs: 0,
      isRunning: true,
      notes: notes.trim(),
    });
  }

  function pauseTimer() {
    if (!activeTimer) {
      return;
    }

    const nextAccumulated =
      activeTimer.accumulatedMs + Math.max(0, Date.now() - new Date(activeTimer.startedAt).getTime());

    setActiveTimer({
      ...activeTimer,
      accumulatedMs: nextAccumulated,
      startedAt: new Date().toISOString(),
      isRunning: false,
    });
  }

  function resumeTimer() {
    if (!activeTimer) {
      return;
    }

    setSaveError(null);
    setActiveTimer({
      ...activeTimer,
      startedAt: new Date().toISOString(),
      isRunning: true,
    });
  }

  async function stopTimer() {
    if (!activeTimer || !activeTask) {
      return;
    }

    const endedAt = new Date();
    const durationMs =
      activeTimer.accumulatedMs +
      (activeTimer.isRunning ? Math.max(0, endedAt.getTime() - new Date(activeTimer.startedAt).getTime()) : 0);

    const startedAt = new Date(endedAt.getTime() - durationMs).toISOString();

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/time-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ideaId: activeTask.ideaId,
          taskId: activeTask.id,
          taskTitle: activeTask.title,
          startedAt,
          endedAt: endedAt.toISOString(),
          durationSeconds: Math.floor(durationMs / 1000),
          notes: activeTimer.notes,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to save time log");
      }

      const saved = payload.data as {
        id: string;
        ideaId: string;
        taskId: string;
        taskTitle: string;
        startedAt: string;
        endedAt: string;
        durationSeconds: number;
        notes: string | null;
      };

      const nextEntry: TimeLogEntry = {
        id: saved.id,
        taskId: saved.taskId,
        taskTitle: saved.taskTitle,
        ideaId: saved.ideaId,
        ideaTitle: activeTask.ideaTitle,
        startedAt: new Date(saved.startedAt).toISOString(),
        endedAt: new Date(saved.endedAt).toISOString(),
        durationMs: saved.durationSeconds * 1000,
        notes: saved.notes ?? "",
      };

      setEntries((current) => [nextEntry, ...current]);
      setActiveTimer(null);
      setSearchParams({
        task: null,
      });
      setNotes("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save time log");
    } finally {
      setIsSaving(false);
    }
  }

  const hasActiveTimer = Boolean(activeTimer);
  const timerIsRunning = activeTimer?.isRunning === true;
  const canStartTimer = Boolean(selectedTask) && !hasActiveTimer;
  const visibleEntries = timeTab === "today" ? todayEntries : timeTab === "week" ? weekEntries : allEntries;

  return (
    <div className="grid gap-4">
      <SiteBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Time" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1.28fr_0.72fr]">
        <Card className="border-border bg-card/92 shadow-xl">
          <CardHeader className="gap-2 p-4 md:p-5">
            <Badge variant="outline" className="w-fit font-mono">
              Time manager
            </Badge>
            <CardTitle className="text-2xl">Track focus inside the workspace</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Pick a task, run a session, and review your real logs without leaving Tubmind.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 p-4 pt-0 md:grid-cols-4 md:p-5 md:pt-0">
            <SummaryStat icon={Clock3} label="Tracked today" value={formatDuration(totalTimeToday)} />
            <SummaryStat icon={Activity} label="Entries today" value={String(todayEntries.length + (timerIsRunning ? 1 : 0))} />
            <SummaryStat icon={CalendarDays} label="Due today" value={String(dueTodayTasks.length)} />
            <SummaryStat icon={Target} label="Overdue" value={String(overdueTasks.length)} destructive />
          </CardContent>
        </Card>

        <Card className="border-border bg-secondary/80 shadow-xl">
          <CardHeader className="gap-2 p-4 pb-3 md:p-5 md:pb-3">
            <div className="flex size-10 items-center justify-center border border-border bg-background/70">
              <BarChart3 className="size-4" />
            </div>
            <CardTitle className="text-lg">Week snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 px-4 pb-4 pt-0 md:px-5 md:pb-5">
            <SummaryMini label="This week" value={formatDuration(weeklyTotalMs)} />
            <SummaryMini label="Daily average" value={formatDuration(weeklyAverageMs)} />
            <SummaryMini label="Upcoming" value={String(dueThisWeekTasks.length)} />
            <SummaryMini label="Completed" value={String(workspace.stats.completedTasks)} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="border-border bg-card/92 shadow-xl">
          <CardHeader className="gap-2 p-4 pb-3 md:p-5 md:pb-3">
            <Badge variant="outline" className="w-fit font-mono">
              Live timer
            </Badge>
            <CardTitle className="text-xl">Focused session</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 pt-0 md:p-5 md:pt-0">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Task
                  </label>
                  <Select
                    value={selectedTaskId}
                    onValueChange={(value) => {
                      setSearchParams({
                        task: value || null,
                      });
                    }}
                    disabled={hasActiveTimer}
                  >
                    <SelectTrigger className="h-12 bg-background/70">
                      <SelectValue placeholder="Select a workspace task" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Notes
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="What are you pushing forward in this session?"
                    className="min-h-20 bg-background/70"
                    disabled={hasActiveTimer}
                  />
                </div>

                {selectedTask ? (
                  <div className="grid gap-1.5 border border-border bg-background/60 p-3 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">{selectedTask.title}</p>
                    <p>{selectedTask.ideaTitle}</p>
                    <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                      <span>{formatShortDate(selectedTask.date)}</span>
                      <span>{selectedTask.deadline ? `Due ${formatShortDate(selectedTask.deadline)}` : "No deadline"}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid content-between gap-3 border border-border bg-background/60 p-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Elapsed
                  </p>
                  <div className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                    {formatDuration(activeElapsedMs)}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {activeTask ? activeTask.title : "Choose a task to start tracking time."}
                  </p>
                </div>

                <div className="grid gap-2">
                  {!hasActiveTimer ? (
                    <Button className="h-12 justify-between" onClick={startTimer} disabled={!canStartTimer}>
                      <span className="inline-flex items-center gap-2">
                        <Play className="size-4" />
                        Start timer
                      </span>
                      <Timer className="size-4" />
                    </Button>
                  ) : (
                    <>
                      {timerIsRunning ? (
                        <Button className="h-11 justify-between" variant="outline" onClick={pauseTimer}>
                          <span className="inline-flex items-center gap-2">
                            <Pause className="size-4" />
                            Pause + hold
                          </span>
                          <Clock3 className="size-4" />
                        </Button>
                      ) : (
                        <Button className="h-11 justify-between" onClick={resumeTimer}>
                          <span className="inline-flex items-center gap-2">
                            <Play className="size-4" />
                            Resume fresh
                          </span>
                          <Zap className="size-4" />
                        </Button>
                      )}
                      <Button
                        className="h-11 justify-between"
                        variant="secondary"
                        onClick={stopTimer}
                        disabled={isSaving}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Square className="size-4" />
                          {isSaving ? "Saving..." : "Stop + save"}
                        </span>
                        <CheckCircle2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {saveError ? (
              <p className="text-sm text-destructive">{saveError}</p>
            ) : null}

            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily focus goal</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                  {Math.round(todayGoalProgress)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden bg-border/70">
                <div
                  className="h-full bg-primary transition-[width] duration-500"
                  style={{ width: `${todayGoalProgress}%` }}
                />
              </div>
            </div>
            {isRoutePending ? (
              <p className="text-sm text-muted-foreground">Updating view...</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/92 shadow-xl">
          <CardHeader className="gap-2 p-4 pb-3 md:p-5 md:pb-3">
            <Badge variant="outline" className="w-fit font-mono">
              Quick filters
            </Badge>
            <CardTitle className="text-xl">What needs time next</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2.5 px-4 pb-4 pt-0 md:px-5 md:pb-5">
            <TaskBucket
              title="Today"
              description="Already on the clock for the current day."
              tasks={dueTodayTasks}
            />
            <TaskBucket
              title="This week"
              description="Upcoming work with near-term dates."
              tasks={dueThisWeekTasks}
            />
            <TaskBucket
              title="Overdue"
              description="Tasks that need recovery before they drift further."
              tasks={overdueTasks}
              destructive
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <Card className="border-border bg-card/92 shadow-xl">
          <CardHeader className="gap-4 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge variant="outline" className="w-fit font-mono">
                  Session logs
                </Badge>
                <CardTitle className="mt-3 text-2xl">Tracked history</CardTitle>
                <CardDescription className="mt-2 max-w-3xl text-sm leading-6">
                  The original tracker had today, week, and all logs. This keeps that shape, but
                  the logs stay connected to your actual Tubmind tasks.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["today", "week", "all"] as TimeTab[]).map((tab) => (
                  <Button
                    key={tab}
                    type="button"
                    size="sm"
                    variant={timeTab === tab ? "default" : "outline"}
                    onClick={() => {
                      setSearchParams({
                        tab: tab === "today" ? null : tab,
                      });
                    }}
                    className="capitalize"
                  >
                    {tab === "week" ? "This week" : tab}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <SummaryMini label="Total logs" value={String(allEntries.length)} />
              <SummaryMini label="Tracked this week" value={formatDuration(weeklyTotalMs)} />
              <SummaryMini label="Shared tasks" value={String(workspace.stats.sharedTasks)} />
              <SummaryMini
                label="Current state"
                value={timerIsRunning ? "Active" : hasActiveTimer ? "Paused" : "Idle"}
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            {visibleEntries.length === 0 ? (
              <div className="grid place-items-center gap-3 border border-dashed border-border bg-background/60 p-10 text-center">
                <Loader2 className="size-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">No tracked sessions yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start the timer above and your first saved session will land here.
                  </p>
                </div>
              </div>
            ) : (
              visibleEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="grid gap-3 border border-border bg-background/70 p-4 transition-colors hover:border-primary/35 hover:bg-background"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-foreground">{entry.taskTitle}</p>
                      <p className="text-sm text-muted-foreground">{entry.ideaTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg text-foreground">{formatDuration(entry.durationMs)}</p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {formatSessionRange(entry.startedAt, entry.endedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {formatShortDate(entry.startedAt)}
                      </Badge>
                      {entry.notes ? (
                        <Badge variant="outline" className="max-w-full truncate font-mono">
                          {entry.notes}
                        </Badge>
                      ) : null}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/tubs/${entry.ideaId}`} className="gap-2">
                        Open idea
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

