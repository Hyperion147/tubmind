export const tubTaskStatuses = [
  "planned",
  "ongoing",
  "shared",
  "completed",
] as const;

export type TubTaskStatus = (typeof tubTaskStatuses)[number];

export type TubTask = {
  id: string;
  title: string;
  description: string;
  date: string;
  deadline: string | null;
  status: TubTaskStatus;
  image: string | null;
  updatedAt: string;
};

export type IdeaTubData = {
  version: 1;
  tasks: TubTask[];
};

export const emptyIdeaTubData: IdeaTubData = {
  version: 1,
  tasks: [],
};

function isTubTaskStatus(value: unknown): value is TubTaskStatus {
  return typeof value === "string" && tubTaskStatuses.includes(value as TubTaskStatus);
}

function isDateValue(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const date = new Date(year, month - 1, day);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function normalizeIdeaTubData(input: unknown): IdeaTubData {
  if (!input || typeof input !== "object") {
    return emptyIdeaTubData;
  }

  const record = input as Record<string, unknown>;
  const tasks = Array.isArray(record.tasks) ? record.tasks : [];

  return {
    version: 1,
    tasks: tasks
      .map((item) => normalizeTubTask(item))
      .filter((task): task is TubTask => task !== null),
  };
}

function normalizeTubTask(input: unknown): TubTask | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.description !== "string" ||
    !isDateValue(record.date) ||
    !(isDateValue(record.deadline) || record.deadline === null) ||
    !isTubTaskStatus(record.status) ||
    typeof record.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    date: record.date,
    deadline: record.deadline,
    status: record.status,
    image: typeof record.image === "string" ? record.image : null,
    updatedAt: record.updatedAt,
  };
}
