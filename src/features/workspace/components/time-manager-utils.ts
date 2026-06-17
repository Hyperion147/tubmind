import type { ActiveTimerState } from "./time-manager-types";

export const DAY_MS = 86_400_000;

export function getDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getWeekStart(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() - next.getDay());
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

export function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export function formatSessionRange(startedAt: string, endedAt: string | null) {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : null;
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${time.format(start)}${end ? ` - ${time.format(end)}` : ""}`;
}

export function readStoredActiveTimer(activeStorageKey: string) {
  if (typeof window === "undefined") {
    return {
      activeTimer: null as ActiveTimerState | null,
    };
  }

  let activeTimer: ActiveTimerState | null = null;
  const storedActiveTimer = window.localStorage.getItem(activeStorageKey);

  if (storedActiveTimer) {
    try {
      activeTimer = JSON.parse(storedActiveTimer) as ActiveTimerState;
    } catch {
      window.localStorage.removeItem(activeStorageKey);
    }
  }

  return { activeTimer };
}
