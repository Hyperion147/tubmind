import { CheckCircle2, CircleDot, Globe2, Lightbulb } from "lucide-react";

import type { ChartConfig } from "@/components/evilcharts/ui/chart";
import { humanize } from "@/features/workspace/lib/formatters";
import type {
    WorkspaceDashboardData,
    WorkspaceIdea,
} from "@/features/workspace/lib/workspace-model";

export const overviewChartConfig = {
    captured: {
        label: "Captured",
        colors: {
            light: ["oklch(0.5200 0.1000 152.000)"],
            dark: ["oklch(0.6200 0.1000 152.000)"],
        },
    },
    refined: {
        label: "Refined",
        colors: {
            light: ["oklch(0.6000 0.0820 168.000)"],
            dark: ["oklch(0.6800 0.0820 168.000)"],
        },
    },
    completed: {
        label: "Completed",
        colors: {
            light: ["oklch(0.6200 0.1200 300.000)"],
            dark: ["oklch(0.7000 0.1200 300.000)"],
        },
    },
} satisfies ChartConfig;

export const tubHealthChartConfig = {
    active: {
        label: "Active",
        colors: {
            light: ["oklch(0.5200 0.1000 152.000)"],
            dark: ["oklch(0.6200 0.1000 152.000)"],
        },
    },
    stale: {
        label: "Stale",
        colors: {
            light: ["oklch(0.8000 0.1500 85.000)"],
            dark: ["oklch(0.8500 0.1300 85.000)"],
        },
    },
    archived: {
        label: "Archived",
        colors: {
            light: ["oklch(0.7800 0.0150 260.000)"],
            dark: ["oklch(0.7000 0.0150 260.000)"],
        },
    },
} satisfies ChartConfig;

export const statusBarStyles = {
    captured: "bg-[var(--color-chart-1)]",
    in_tub: "bg-[var(--color-chart-2)]",
    in_progress: "bg-[oklch(0.8_0.15_85)]",
    ready: "bg-[oklch(0.62_0.12_300)]",
    published: "bg-[var(--color-chart-5)]",
} as const;

export function buildOverviewSeries(workspace: WorkspaceDashboardData) {
    const dates = getPastSevenDays();

    return dates.map((date, index) => {
        const dayStart = getDayStart(date);
        const dayEnd = getDayEnd(date);

        const captured = workspace.ideas.filter((idea) =>
            isWithinDay(idea.createdAt, dayStart, dayEnd),
        ).length;
        const refined = workspace.ideas.filter((idea) =>
            isIdeaRefinedOnDay(idea, dayStart, dayEnd),
        ).length;
        const completed = workspace.tasks.filter((task) => {
            return (
                task.status === "completed" &&
                isWithinDay(task.updatedAt, dayStart, dayEnd)
            );
        }).length;

        return {
            label: formatAxisDay(date),
            captured: index > 0 ? Math.max(captured, 0) : captured,
            refined,
            completed,
        };
    });
}

export function buildTubHealth(workspace: WorkspaceDashboardData) {
    const total = Math.max(1, workspace.ideas.length);
    const counts = {
        active: workspace.ideas.filter((idea) =>
            ["in_progress", "submitted", "published"].includes(idea.status),
        ).length,
        stale: workspace.ideas.filter((idea) =>
            ["draft", "needs_revision"].includes(idea.status),
        ).length,
        archived: workspace.ideas.filter((idea) => idea.status === "archived")
            .length,
    };

    return [
        {
            state: "active",
            value: counts.active,
            percentage: Math.round((counts.active / total) * 100),
            swatch: "oklch(0.5200 0.1000 152.000)",
        },
        {
            state: "stale",
            value: counts.stale,
            percentage: Math.round((counts.stale / total) * 100),
            swatch: "oklch(0.8000 0.1500 85.000)",
        },
        {
            state: "archived",
            value: counts.archived,
            percentage: Math.round((counts.archived / total) * 100),
            swatch: "oklch(0.7800 0.0150 260.000)",
        },
    ];
}

export function buildActivityFeed(workspace: WorkspaceDashboardData) {
    const ideaEvents = workspace.ideas.slice(0, 3).map((idea) => ({
        title:
            idea.status === "published" || idea.visibility === "public"
                ? "Published an idea"
                : "Updated an idea space",
        subtitle: idea.title,
        timestamp: idea.updatedAt,
        icon:
            idea.status === "published" || idea.visibility === "public"
                ? Globe2
                : Lightbulb,
    }));

    const taskEvents = workspace.tasks.slice(0, 3).map((task) => ({
        title: `Moved task to ${humanize(task.status)}`,
        subtitle: task.title,
        timestamp: task.updatedAt,
        icon: task.status === "completed" ? CheckCircle2 : CircleDot,
    }));

    return [...ideaEvents, ...taskEvents].sort(
        (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
}

export function buildStatusBreakdown(workspace: WorkspaceDashboardData) {
    const total = Math.max(1, workspace.ideas.length);
    const values = [
        {
            key: "captured" as const,
            label: "Captured",
            value: workspace.ideas.length,
        },
        {
            key: "in_tub" as const,
            label: "In Tub",
            value: workspace.ideas.filter((idea) => idea.tasks.length > 0)
                .length,
        },
        {
            key: "in_progress" as const,
            label: "In Progress",
            value: workspace.ideas.filter(
                (idea) => idea.status === "in_progress",
            ).length,
        },
        {
            key: "ready" as const,
            label: "Ready to Publish",
            value: workspace.ideas.filter((idea) => idea.status === "submitted")
                .length,
        },
        {
            key: "published" as const,
            label: "Published",
            value: workspace.ideas.filter(
                (idea) =>
                    idea.status === "published" || idea.visibility === "public",
            ).length,
        },
    ];

    return values.map((item) => ({
        ...item,
        percentage: Math.round((item.value / total) * 100),
    }));
}

export function formatRangeLabel(daysBack: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysBack);

    const startLabel = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    const endLabel = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return `${startLabel} - ${endLabel}`;
}

export function formatRelativeTime(value: string) {
    const date = new Date(value);
    const diffMs = date.getTime() - Date.now();
    const diffHours = Math.round(diffMs / 3_600_000);

    if (Math.abs(diffHours) < 24) {
        return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
            diffHours,
            "hour",
        );
    }

    const diffDays = Math.round(diffMs / 86_400_000);
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        diffDays,
        "day",
    );
}

export function getFirstName(value: string) {
    return value.split(" ")[0] || "there";
}

export function getTubBarWidth(idea: WorkspaceIdea, topTubs: WorkspaceIdea[]) {
    const maxTasks = Math.max(1, ...topTubs.map((item) => item.tasks.length));
    return (idea.tasks.length / maxTasks) * 100;
}

export function getWindowBounds(lengthInDays: number, daysAgo: number) {
    const end = getDayEnd(new Date());
    end.setDate(end.getDate() - daysAgo);

    const start = getDayStart(end);
    start.setDate(start.getDate() - (lengthInDays - 1));

    return { start, end };
}

export function countItemsInWindow<T>(
    items: T[],
    getDate: (item: T) => string,
    window: { start: Date; end: Date },
) {
    return items.filter((item) => {
        const timestamp = new Date(getDate(item)).getTime();
        return timestamp >= window.start.getTime() && timestamp <= window.end.getTime();
    }).length;
}

export function isRefinedWithinWindow(
    idea: WorkspaceIdea,
    window: { start: Date; end: Date },
) {
    const createdAt = new Date(idea.createdAt).getTime();
    const updatedAt = new Date(idea.updatedAt).getTime();

    return (
        updatedAt > createdAt &&
        updatedAt >= window.start.getTime() &&
        updatedAt <= window.end.getTime()
    );
}

export function formatWindowSummary(
    current: number,
    previous: number,
    verb: string,
) {
    if (current === 0 && previous === 0) {
        return `No ideas ${verb} in the last 14 days`;
    }

    if (previous === 0) {
        return `${current} ${current === 1 ? "idea" : "ideas"} ${verb} in the last 7 days`;
    }

    const delta = current - previous;
    const deltaLabel =
        delta === 0
            ? "flat week over week"
            : `${delta > 0 ? "+" : ""}${delta} vs previous 7 days`;

    return `${current} in the last 7 days, ${deltaLabel}`;
}

function getPastSevenDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - index));
        return day;
    });
}

function formatAxisDay(value: Date) {
    return value.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function getDayStart(value: Date | string) {
    const date = typeof value === "string" ? new Date(value) : value;
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0,
        0,
    );
}

function getDayEnd(value: Date | string) {
    const dayEnd = getDayStart(value);
    dayEnd.setHours(23, 59, 59, 999);
    return dayEnd;
}

function isWithinDay(
    value: string,
    dayStart: Date,
    dayEnd: Date,
) {
    const timestamp = new Date(value).getTime();
    return timestamp >= dayStart.getTime() && timestamp <= dayEnd.getTime();
}

function isIdeaRefinedOnDay(
    idea: WorkspaceIdea,
    dayStart: Date,
    dayEnd: Date,
) {
    const createdAt = new Date(idea.createdAt).getTime();
    const updatedAt = new Date(idea.updatedAt).getTime();

    return updatedAt > createdAt && updatedAt >= dayStart.getTime() && updatedAt <= dayEnd.getTime();
}
