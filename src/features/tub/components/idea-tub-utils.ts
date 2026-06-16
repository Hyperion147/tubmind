import type { ChangeEvent } from "react";

import type { TubTask } from "@/lib/tub";

import type { TaskDraft } from "./idea-tub-types";

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateValue(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function parseDateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getTodayDateValue() {
  return toDateValue(new Date());
}

export function createEmptyDraft(): TaskDraft {
  return {
    title: "",
    description: "",
    deadline: null,
    status: "planned",
    image: null,
  };
}

export function formatDateLabel(value: string) {
  if (!value) {
    return "No day selected";
  }

  const date = parseDateValue(value);

  if (!date) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatIsoDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function createCalendarDays(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const leading = start.getDay();
  const trailing = 6 - end.getDay();
  const days: Array<{ value: string; inMonth: boolean }> = [];

  for (let index = leading; index > 0; index -= 1) {
    const day = new Date(start);
    day.setDate(start.getDate() - index);
    days.push({ value: toDateValue(day), inMonth: false });
  }

  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push({
      value: toDateValue(new Date(month.getFullYear(), month.getMonth(), day)),
      inMonth: true,
    });
  }

  for (let index = 1; index <= trailing; index += 1) {
    const day = new Date(end);
    day.setDate(end.getDate() + index);
    days.push({ value: toDateValue(day), inMonth: false });
  }

  return days;
}

export async function readImageFile(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) {
    return null;
  }

  if (file.size > 900_000) {
    throw new Error("Please use an image smaller than 900 KB for task references.");
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function compareTasks(left: TubTask, right: TubTask) {
  if (left.date !== right.date) {
    return left.date.localeCompare(right.date);
  }

  if (left.deadline && right.deadline && left.deadline !== right.deadline) {
    return left.deadline.localeCompare(right.deadline);
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}
