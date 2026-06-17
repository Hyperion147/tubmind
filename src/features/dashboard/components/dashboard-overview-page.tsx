import Link from "next/link";
import {
    ArrowRight,
    CalendarRange,
    CheckCircle2,
    CircleDot,
    Clock3,
    FolderKanban,
    Globe2,
    Lightbulb,
    MessageCircleMore,
    Plus,
    Sparkles,
    Target,
} from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import {
    EvilLineChart,
    Grid as LineGrid,
    Legend as LineLegend,
    Line,
    XAxis,
    YAxis,
    Dot,
    ActiveDot,
    Tooltip,
} from "@/components/evilcharts/charts/line-chart";
import {
    EvilPieChart,
    Pie,
    Tooltip as PieTooltip,
} from "@/components/evilcharts/charts/pie-chart";
import type { ChartConfig } from "@/components/evilcharts/ui/chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    formatShortDate,
    humanize,
    isTaskOverdue,
} from "@/features/workspace/lib/formatters";
import {
    getTaskHref,
    type WorkspaceDashboardData,
    type WorkspaceIdea,
} from "@/features/workspace/lib/workspace-model";

const overviewChartConfig = {
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

const tubHealthChartConfig = {
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

const statusBarStyles = {
    captured: "bg-[var(--color-chart-1)]",
    in_tub: "bg-[var(--color-chart-2)]",
    in_progress: "bg-[oklch(0.8_0.15_85)]",
    ready: "bg-[oklch(0.62_0.12_300)]",
    published: "bg-[var(--color-chart-5)]",
} as const;

type DashboardOverviewPageProps = {
    displayName: string;
    workspace: WorkspaceDashboardData;
};

export function DashboardOverviewPage({
    displayName,
    workspace,
}: DashboardOverviewPageProps) {
    const overviewData = buildOverviewSeries(workspace);
    const overviewMax = Math.max(
        6,
        ...overviewData.flatMap((item) => [
            item.captured,
            item.refined,
            item.completed,
        ]),
    );
    const tubHealth = buildTubHealth(workspace);
    const recentIdeas = workspace.ideas.slice(0, 5);
    const priorityTasks = workspace.tasks
        .filter((task) => task.status !== "completed")
        .sort((a, b) => {
            if (isTaskOverdue(a) && !isTaskOverdue(b)) return -1;
            if (!isTaskOverdue(a) && isTaskOverdue(b)) return 1;
            return (
                new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime()
            );
        })
        .slice(0, 4);
    const topTubs = [...workspace.ideas]
        .sort(
            (a, b) =>
                b.tasks.length - a.tasks.length || b.comments - a.comments,
        )
        .slice(0, 5);
    const activityFeed = buildActivityFeed(workspace).slice(0, 4);
    const statusBreakdown = buildStatusBreakdown(workspace);
    const totalComments = workspace.ideas.reduce(
        (sum, idea) => sum + idea.comments,
        0,
    );
    const ideasInTubs = workspace.ideas.filter(
        (idea) => idea.tasks.length > 0,
    ).length;
    const activeTubs =
        tubHealth.find((item) => item.state === "active")?.value ?? 0;
    const dateRangeLabel = formatRangeLabel(6);
    const firstName = getFirstName(displayName);
    const recentWindow = getWindowBounds(7, 0);
    const previousWindow = getWindowBounds(7, 7);
    const recentCaptures = countItemsInWindow(
        workspace.ideas,
        (idea) => idea.createdAt,
        recentWindow,
    );
    const previousCaptures = countItemsInWindow(
        workspace.ideas,
        (idea) => idea.createdAt,
        previousWindow,
    );
    const refinedIdeasThisWeek = workspace.ideas.filter((idea) =>
        isRefinedWithinWindow(idea, recentWindow),
    ).length;
    const ideasWithComments = workspace.ideas.filter(
        (idea) => idea.comments > 0,
    ).length;
    const totalTasksLinked = workspace.ideas.reduce(
        (sum, idea) => sum + idea.tasks.length,
        0,
    );
    const completedThisWeek = countItemsInWindow(
        workspace.tasks.filter((task) => task.status === "completed"),
        (task) => task.updatedAt,
        recentWindow,
    );

    const statCards = [
        {
            label: "Ideas Captured",
            value: workspace.stats.totalIdeas,
            detail: formatWindowSummary(
                recentCaptures,
                previousCaptures,
                "captured",
            ),
            icon: Lightbulb,
        },
        {
            label: "Ideas in Tubs",
            value: ideasInTubs,
            detail: `${totalTasksLinked} linked ${totalTasksLinked === 1 ? "task" : "tasks"} across your tubs`,
            icon: FolderKanban,
        },
        {
            label: "Public Ideas",
            value: workspace.stats.publicIdeas,
            detail: `${refinedIdeasThisWeek} refined in the last 7 days`,
            icon: Globe2,
        },
        {
            label: "Comments",
            value: totalComments,
            detail: `${ideasWithComments} ${ideasWithComments === 1 ? "idea has" : "ideas have"} visible discussion`,
            icon: MessageCircleMore,
        },
        {
            label: "Active Tubs",
            value: activeTubs,
            detail: `${completedThisWeek} ${completedThisWeek === 1 ? "task was" : "tasks were"} completed this week`,
            icon: Target,
        },
    ];

    return (
        <div className="grid gap-4">
            <SiteBreadcrumb
                items={[
                    { label: "Dashboard" },
                ]}
            />

            <section className="grid gap-4 border border-border bg-card p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-semibold tracking-tight text-primary">
                            Welcome, {firstName}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                            Capture ideas, organize them in tubs, refine the
                            strongest ones, and keep your workspace moving with
                            clear visibility.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="inline-flex h-10 items-center gap-2 px-3 text-sm text-foreground">
                            <CalendarRange className="size-4 text-muted-foreground" />
                            <span>{dateRangeLabel}</span>
                        </div>
                        <Button asChild variant="fill" className="rounded-none px-4 shadow-sm">
                            <Link href="/dashboard/ideas" className="gap-2">
                                <Plus className="size-4" />
                                <span>Capture Idea</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {statCards.map((card) => (
                        <StatCard
                            key={card.label}
                            label={card.label}
                            detail={card.detail}
                            value={card.value}
                            icon={card.icon}
                        />
                    ))}
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.5fr_1.1fr]">
                <Card className="border border-border bg-card/92 shadow-sm">
                    <CardHeader className="border-b border-border">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-xl font-semibold text-foreground">
                                    Ideas Overview
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Daily activity across new captures, refined
                                    ideas, and completed tasks.
                                </p>
                            </div>
                            <Button
                                asChild
                                variant="fill2"
                                size="sm"
                                className="rounded-none"
                            >
                                <Link href="/dashboard/ideas" className="gap-2">
                                    <span>View full report</span>
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6">
                        <EvilLineChart
                            className="h-70 w-full"
                            config={overviewChartConfig}
                            data={overviewData}
                            chartProps={{
                                margin: {
                                    right: 8,
                                    bottom: 0,
                                },
                            }}
                        >
                            <LineLegend align="right" verticalAlign="top" />
                            <LineGrid vertical={false} strokeDasharray="0" />
                            <XAxis dataKey="label" tickMargin={12} />
                            <YAxis
                                domain={[0, overviewMax + 4]}
                                allowDecimals={false}
                                tickMargin={12}
                            />
                            <Tooltip />
                            <Line
                                dataKey="captured"
                                strokeVariant="solid"
                                curveType="monotone"
                            >
                                <Dot variant="border" />
                                <ActiveDot variant="colored-border" />
                            </Line>
                            <Line
                                dataKey="refined"
                                strokeVariant="solid"
                                curveType="monotone"
                            >
                                <Dot variant="border" />
                                <ActiveDot variant="colored-border" />
                            </Line>
                            <Line
                                dataKey="completed"
                                strokeVariant="solid"
                                curveType="monotone"
                            >
                                <Dot variant="border" />
                                <ActiveDot variant="colored-border" />
                            </Line>
                        </EvilLineChart>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card/92 shadow-sm">
                    <CardHeader className="border-b border-border">
                        <div className="flex flex-wrap items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-semibold text-foreground">
                                    Tub Health
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Status split across your active, stale, and
                                    archived tubs.
                                </p>
                            </div>
                            <Button
                                asChild
                                variant="fill2"
                                size="sm"
                                className="rounded-none shadow-sm"
                            >
                                <Link href="/dashboard/tubs" className="gap-2">
                                    <span>Manage tubs</span>
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-5 px-5 pb-5 pt-5 sm:grid-cols-[240px_1fr] sm:items-center">
                        <div className="relative mx-auto flex h-55 w-full max-w-60 items-center justify-center">
                            <EvilPieChart
                                className="h-full w-full"
                                data={tubHealth}
                                dataKey="value"
                                nameKey="state"
                                config={tubHealthChartConfig}
                            >
                                <PieTooltip />
                                <Pie
                                    innerRadius={66}
                                    outerRadius={100}
                                    isClickable
                                    paddingAngle={1.5}
                                />
                            </EvilPieChart>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                <p className="text-4xl font-semibold text-foreground">
                                    {workspace.ideas.length}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {tubHealth.map((item) => (
                                <div
                                    key={item.state}
                                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border border-border bg-background/70 px-3 py-3"
                                >
                                    <span
                                        className="size-3 border border-border"
                                        style={{ background: item.swatch }}
                                        aria-hidden="true"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">
                                            {humanize(item.state)}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {item.value} ({item.percentage}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <PanelCard
                    title="Recent Ideas"
                    footerHref="/dashboard/ideas"
                    footerLabel="View all ideas"
                >
                    {recentIdeas.length === 0 ? (
                        <EmptyPanel copy="No ideas captured yet. Your latest idea spaces will show up here." />
                    ) : (
                        <div className="grid gap-4">
                            {recentIdeas.map((idea) => (
                                <Link
                                    key={idea.id}
                                    href={`/dashboard/tubs/${idea.id}`}
                                    className="grid gap-1 border-b border-border/70 pb-4 last:border-b-0 last:pb-0"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                                            {idea.title}
                                        </p>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatRelativeTime(idea.updatedAt)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <InlineMeta>
                                            {idea.spaceType ?? "untagged"}
                                        </InlineMeta>
                                        <span>in</span>
                                        <span>
                                            {idea.targetAudience ??
                                                "Private workspace"}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </PanelCard>

                <PanelCard
                    title="Tasks Due Soon"
                    footerHref="/dashboard/tasks"
                    footerLabel="View all tasks"
                >
                    {priorityTasks.length === 0 ? (
                        <EmptyPanel copy="No active tasks right now. Upcoming work will appear here." />
                    ) : (
                        <div className="grid gap-4">
                            {priorityTasks.map((task) => (
                                <Link
                                    key={task.id}
                                    href={getTaskHref(task)}
                                    className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-border/70 pb-4 last:border-b-0 last:pb-0"
                                >
                                    <span
                                        className="mt-1 size-3 border border-border bg-background"
                                        aria-hidden="true"
                                    />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Due{" "}
                                            {formatShortDate(
                                                task.deadline ?? task.date,
                                            )}
                                        </p>
                                    </div>
                                    <div className="justify-self-end">
                                        <StatusPill
                                            label={task.status}
                                            overdue={isTaskOverdue(task)}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </PanelCard>

                <PanelCard
                    title="Activity Feed"
                    footerHref="/dashboard/tubs"
                    footerLabel="View all activity"
                >
                    {activityFeed.length === 0 ? (
                        <EmptyPanel copy="No recent activity yet. Idea and task updates will collect here." />
                    ) : (
                        <div className="grid gap-4">
                            {activityFeed.map((item) => (
                                <div
                                    key={`${item.title}-${item.timestamp}`}
                                    className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-border/70 pb-4 last:border-b-0 last:pb-0"
                                >
                                    <div className="mt-1 flex size-8 items-center justify-center bg-secondary text-primary">
                                        <item.icon className="size-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm text-foreground">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                    <span className="justify-self-end text-xs text-muted-foreground">
                                        {formatRelativeTime(item.timestamp)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </PanelCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <PanelCard
                    title="Top Idea Tubs"
                    footerHref="/dashboard/tubs"
                    footerLabel="View all tubs"
                >
                    {topTubs.length === 0 ? (
                        <EmptyPanel copy="No tubs yet. Once ideas start collecting tasks, rankings will show here." />
                    ) : (
                        <div className="grid gap-4">
                            {topTubs.map((idea, index) => (
                                <div
                                    key={idea.id}
                                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3"
                                >
                                    <div className="flex size-6 items-center justify-center border border-border bg-background text-xs text-muted-foreground">
                                        {index + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {idea.title}
                                        </p>
                                        <div className="mt-2 h-2 w-full bg-secondary/80">
                                            <div
                                                className="h-full bg-[var(--color-chart-1)]"
                                                style={{
                                                    width: `${Math.max(14, getTubBarWidth(idea, topTubs))}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {idea.tasks.length}{" "}
                                        {idea.tasks.length === 1
                                            ? "task"
                                            : "tasks"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </PanelCard>

                <PanelCard
                    title="Ideas by Status"
                    footerHref="/dashboard/ideas"
                    footerLabel="View full breakdown"
                >
                    <div className="grid gap-4">
                        {statusBreakdown.map((item) => (
                            <div key={item.key} className="grid gap-2">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-muted-foreground">
                                        {item.label}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {item.value}
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary/80">
                                    <div
                                        className={`h-full ${statusBarStyles[item.key]}`}
                                        style={{
                                            width: `${Math.max(item.value > 0 ? 12 : 0, item.percentage)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </PanelCard>

                <PanelCard title="Quick Actions">
                    <div className="grid gap-4">
                        <QuickAction
                            href="/dashboard/ideas"
                            icon={Lightbulb}
                            title="Capture a new idea"
                        />
                        <QuickAction
                            href="/dashboard/tubs"
                            icon={FolderKanban}
                            title="Open idea tubs"
                        />
                        <QuickAction
                            href="/dashboard/tasks"
                            icon={CheckCircle2}
                            title="Review tasks"
                        />
                        <QuickAction
                            href="/dashboard/time"
                            icon={Clock3}
                            title="Track time"
                        />
                    </div>
                </PanelCard>
            </section>
        </div>
    );
}

function StatCard({
    label,
    value,
    detail,
    icon: Icon,
}: {
    label: string;
    value: number;
    detail: string;
    icon: typeof Lightbulb;
}) {
    return (
        <div className="border border-border bg-background/82 p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-4xl font-semibold tracking-tight text-foreground">
                        {value}
                    </p>
                </div>
                <div className="flex size-9 items-center justify-center bg-secondary text-primary">
                    <Icon className="size-4" />
                </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
        </div>
    );
}

function PanelCard({
    title,
    footerHref,
    footerLabel,
    children,
}: {
    title: string;
    footerHref?: string;
    footerLabel?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="border border-border bg-card/92 shadow-sm">
            <CardHeader className="border-b border-border">
                <CardTitle className="text-xl font-semibold text-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">{children}</div>
                {footerHref && footerLabel ? (
                    <div className="mt-5 border-t border-border pt-4 text-right">
                        <Link
                            href={footerHref}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {footerLabel}
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

function EmptyPanel({ copy }: { copy: string }) {
    return (
        <div className="border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
            {copy}
        </div>
    );
}

function InlineMeta({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground">
            {children}
        </span>
    );
}

function StatusPill({
    label,
    overdue = false,
}: {
    label: string;
    overdue?: boolean;
}) {
    const colorClass = overdue
        ? "bg-destructive/10 text-destructive"
        : label === "shared"
          ? "bg-secondary text-secondary-foreground"
          : label === "ongoing"
            ? "bg-[color-mix(in_oklch,var(--primary)_16%,white)] text-primary"
            : "bg-background text-muted-foreground";

    return (
        <span
            className={`inline-flex items-center px-2 py-1 text-[11px] font-medium capitalize ${colorClass}`}
        >
            {overdue ? "Overdue" : humanize(label)}
        </span>
    );
}

function QuickAction({
    href,
    icon: Icon,
    title,
}: {
    href: string;
    icon: typeof Sparkles;
    title: string;
}) {
    return (
        <Link
            href={href}
            className="flex gap-2 items-center border border-border bg-background/72 p-3 transition-colors hover:border-primary/35 hover:bg-secondary/40 w-full"
        >
            <div className="flex size-8 items-center justify-center bg-secondary text-primary">
                <Icon className="size-4" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
            </div>
            <ArrowRight className="size-4 justify-self-end" />
        </Link>
    );
}

function buildOverviewSeries(workspace: WorkspaceDashboardData) {
    const dates = getPastSevenDays();

    return dates.map((date, index) => {
        const dayStart = getDayStart(date);
        const dayEnd = getDayEnd(date);

        const captured = workspace.ideas.filter(
            (idea) => isWithinDay(idea.createdAt, dayStart, dayEnd),
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

function buildTubHealth(workspace: WorkspaceDashboardData) {
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

function buildActivityFeed(workspace: WorkspaceDashboardData) {
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

function buildStatusBreakdown(workspace: WorkspaceDashboardData) {
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

function getPastSevenDays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - index));
        return day;
    });
}

function formatRangeLabel(daysBack: number) {
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

function formatAxisDay(value: Date) {
    return value.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function formatRelativeTime(value: string) {
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

function getFirstName(value: string) {
    return value.split(" ")[0] || "there";
}

function getTubBarWidth(idea: WorkspaceIdea, topTubs: WorkspaceIdea[]) {
    const maxTasks = Math.max(1, ...topTubs.map((item) => item.tasks.length));
    return (idea.tasks.length / maxTasks) * 100;
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

function getWindowBounds(lengthInDays: number, daysAgo: number) {
    const end = getDayEnd(new Date());
    end.setDate(end.getDate() - daysAgo);

    const start = getDayStart(end);
    start.setDate(start.getDate() - (lengthInDays - 1));

    return { start, end };
}

function countItemsInWindow<T>(
    items: T[],
    getDate: (item: T) => string,
    window: { start: Date; end: Date },
) {
    return items.filter((item) => {
        const timestamp = new Date(getDate(item)).getTime();
        return timestamp >= window.start.getTime() && timestamp <= window.end.getTime();
    }).length;
}

function isRefinedWithinWindow(
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

function formatWindowSummary(
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
