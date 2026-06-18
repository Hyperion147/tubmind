export type TimeLogEntry = {
  id: string;
  taskId: string;
  taskTitle: string;
  ideaId: string;
  ideaTitle: string;
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  notes: string;
};

export type ActiveTimerState = {
  taskId: string;
  startedAt: string;
  accumulatedMs: number;
  isRunning: boolean;
  notes: string;
};

export type TimeTab = "today" | "week" | "all";
