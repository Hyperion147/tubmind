import type { SortValue } from "./tasks-page-types";

export function isSortValue(value: string | null): value is SortValue {
    return (
        value === "task-date-asc" ||
        value === "deadline-asc" ||
        value === "updated-desc" ||
        value === "title-asc" ||
        value === "task-date-desc"
    );
}

export function compareNullableDate(a: string | null, b: string | null) {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
}
