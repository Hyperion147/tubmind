"use client";

import {
    ArrowRight,
    CalendarRange,
    Clock3,
    FilePenLine,
    FolderKanban,
    Globe2,
    LayoutDashboard,
    Lightbulb,
    ListTodo,
    LockKeyhole,
    Send,
    X,
} from "lucide-react";
import type { ComponentProps } from "react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/plus-icon";
import { cn } from "@/lib/utils";
import Image from "next/image";

type IdeaStatus =
    | "Captured"
    | "In Tub"
    | "In Progress"
    | "Ready to Publish"
    | "Published";

type Idea = {
    title: string;
    status: IdeaStatus;
    workspace: string;
    updated: string;
    tasks: number;
    comments: number;
    visibility?: "private" | "public";
    allowComments?: boolean;
};

type Task = {
    title: string;
    due: string;
    status: "planned" | "ongoing" | "completed";
};

type DashboardPage = "Overview" | "Projects" | "Ideas" | "Tasks" | "Time";
type FormSubmitEvent = Parameters<
    NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type CaptureFormState = {
    title: string;
    status: "draft" | "in_progress" | "submitted" | "published";
    visibility: "private" | "public";
    allowComments: boolean;
};

const defaultCaptureForm: CaptureFormState = {
    title: "",
    status: "draft",
    visibility: "private",
    allowComments: true,
};

const initialIdeas: Idea[] = [
    {
        title: "Public idea card cleanup",
        status: "Ready to Publish",
        workspace: "Publishing",
        updated: "3 days ago",
        tasks: 4,
        comments: 2,
    },
];

const tasks: Task[] = [
    { title: "Hello", due: "Due Jun 4, 2026", status: "ongoing" },
    {
        title: "Attach two references",
        due: "Due Jun 6, 2026",
        status: "planned",
    },
    { title: "Review public copy", due: "Due Jun 7, 2026", status: "planned" },
];

const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Projects", icon: FolderKanban },
    { label: "Ideas", icon: FilePenLine },
    { label: "Tasks", icon: ListTodo },
    { label: "Time", icon: Clock3 },
] satisfies { label: DashboardPage; icon: typeof LayoutDashboard }[];

const overviewPoints = [
    { label: "Jun 1", captured: 0, completed: 0, published: 0 },
    { label: "Jun 2", captured: 1, completed: 0, published: 0 },
    { label: "Jun 3", captured: 1, completed: 0, published: 0 },
    { label: "Jun 4", captured: 2, completed: 0, published: 0 },
    { label: "Jun 5", captured: 2, completed: 0, published: 0 },
    { label: "Jun 6", captured: 2, completed: 1, published: 1 },
    { label: "Jun 7", captured: 2, completed: 1, published: 1 },
];

const statusBars = [
    ["Captured", 6, "w-full", "bg-[var(--color-chart-1)]"],
    ["In Tub", 4, "w-2/3", "bg-[var(--color-chart-2)]"],
    ["In Progress", 2, "w-1/3", "bg-[oklch(0.8_0.15_85)]"],
    ["Ready to Publish", 1, "w-1/5", "bg-[oklch(0.62_0.12_300)]"],
    ["Published", 2, "w-1/3", "bg-[var(--color-chart-5)]"],
] as const;

export function LandingDashboardCta() {
    const [ideas, setIdeas] = useState(initialIdeas);
    const [activePage, setActivePage] = useState<DashboardPage>("Overview");
    const [captureOpen, setCaptureOpen] = useState(false);
    const [captureForm, setCaptureForm] =
        useState<CaptureFormState>(defaultCaptureForm);
    const [isPending, startTransition] = useTransition();

    const recentIdeas = ideas.slice(0, 4);
    const topTubs = [...ideas].sort((a, b) => b.tasks - a.tasks).slice(0, 3);

    function captureIdea() {
        setCaptureOpen(true);
    }

    function closeCaptureForm() {
        setCaptureOpen(false);
    }

    function updateCaptureForm<Key extends keyof CaptureFormState>(
        key: Key,
        value: CaptureFormState[Key],
    ) {
        setCaptureForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function submitCaptureForm(event: FormSubmitEvent) {
        event.preventDefault();

        const title = captureForm.title.trim();

        if (!title) {
            return;
        }

        const nextIdea: Idea = {
            title,
            status: mapCaptureStatus(captureForm.status),
            workspace:
                captureForm.visibility === "public"
                    ? "Public listing"
                    : "Private workspace",
            updated: "just now",
            tasks: captureForm.status === "draft" ? 1 : 2,
            comments: captureForm.allowComments ? 0 : 0,
            visibility: captureForm.visibility,
            allowComments: captureForm.allowComments,
        };

        startTransition(() => {
            setIdeas((current) => [
                nextIdea,
                ...current.filter((idea) => idea.title !== title),
            ]);
            setActivePage("Overview");
            setCaptureOpen(false);
            setCaptureForm(defaultCaptureForm);
        });
    }

    const pageTitle =
        activePage === "Overview"
            ? "Welcome, User"
            : activePage === "Projects"
              ? "Idea Tubs"
              : activePage;

    return (
        <section
            id="dashboard-preview"
            className="relative isolate mt-10 w-full overflow-hidden px-3 pb-14 pt-6 text-left sm:px-4 md:px-6 md:pb-24 md:pt-12"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[50%] bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklch,var(--accent)_12%,var(--background))_20%,color-mix(in_oklch,var(--accent)_100%,var(--background))_100%)]"
            />

            <div className="relative mx-auto flex h-[70vh] w-[360px] max-w-full overflow-hidden border border-primary/16 bg-card/95 shadow-[0_30px_76px_-44px_color-mix(in_oklch,var(--foreground)_30%,transparent),0_16px_32px_-30px_color-mix(in_oklch,var(--primary)_22%,transparent),0_0_0_1px_color-mix(in_oklch,var(--background)_72%,transparent)_inset] md:h-[680px] md:w-full md:max-w-6xl lg:h-[740px]">
                <aside className="hidden w-20 shrink-0 border-r border-border bg-card/95 md:flex md:flex-col md:items-center md:gap-3 md:px-2 md:py-4">
                    <div className="flex size-11 items-center justify-center border border-border bg-secondary shadow-[3px_3px_0_0_var(--color-border)]">
                        <Image
                            src="/logo.png"
                            alt="TUBMIND Logo"
                            width={36}
                            height={36}
                        />
                    </div>
                    <nav className="mt-4 grid gap-2">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                title={item.label}
                                onClick={() => setActivePage(item.label)}
                                aria-pressed={activePage === item.label}
                                className={cn(
                                    "flex size-11 items-center justify-center border border-border bg-background/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                                    activePage === item.label &&
                                        "border-primary/45 bg-secondary text-foreground shadow-[3px_3px_0_0_var(--color-border)]",
                                )}
                            >
                                <item.icon className="size-4" />
                            </button>
                        ))}
                    </nav>
                    <div className="mt-auto border border-border bg-background/70 p-2 shadow-[3px_3px_0_0_var(--color-border)]">
                        <div className="flex size-8 items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
                            S
                        </div>
                    </div>
                </aside>

                <div
                    data-lenis-prevent
                    className="min-w-0 flex-1 overflow-hidden bg-background/45 p-2.5 [scroll-behavior:auto] sm:p-3 md:overflow-y-auto md:p-4 md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
                >
                    <div className="grid gap-4">
                        <div className="border border-dashed border-border/70 bg-background/55 px-3 py-2 text-xs leading-5 text-muted-foreground md:hidden">
                            Dashboard preview is interactive on desktop. On
                            mobile, it stays on the overview page for a cleaner
                            read.
                        </div>

                        <section className="grid gap-5 border border-border bg-card/90 p-3 shadow-sm sm:p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    {pageTitle}
                                </h2>

                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                                    <div className="inline-flex min-h-10 items-center gap-2 px-1 text-sm text-foreground sm:px-3">
                                        <CalendarRange className="size-4 text-muted-foreground" />
                                        <span>Jun 1 - Jun 7, 2026</span>
                                    </div>
                                    <Button
                                        type="button"
                                        className="hidden rounded-none px-4 shadow-xs md:inline-flex"
                                        onClick={captureIdea}
                                    >
                                        <PlusIcon
                                            size={16}
                                            duration={0.8}
                                            className={cn(
                                                "size-4",
                                                isPending && "animate-pulse",
                                            )}
                                        />
                                        <span>Capture Idea</span>
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {activePage === "Overview" ? (
                            <OverviewPage
                                ideas={ideas}
                                recentIdeas={recentIdeas}
                                topTubs={topTubs}
                            />
                        ) : activePage === "Projects" ? (
                            <ProjectsPage ideas={ideas} topTubs={topTubs} />
                        ) : activePage === "Ideas" ? (
                            <IdeasPage
                                captureIdea={captureIdea}
                                ideas={ideas}
                            />
                        ) : activePage === "Tasks" ? (
                            <TasksPage />
                        ) : (
                            <TimePage />
                        )}
                    </div>
                </div>

                {captureOpen ? (
                    <CaptureIdeaDialog
                        form={captureForm}
                        isPending={isPending}
                        onChange={updateCaptureForm}
                        onClose={closeCaptureForm}
                        onSubmit={submitCaptureForm}
                    />
                ) : null}
            </div>
        </section>
    );
}

function mapCaptureStatus(status: CaptureFormState["status"]): IdeaStatus {
    if (status === "published") {
        return "Published";
    }

    if (status === "submitted") {
        return "Ready to Publish";
    }

    if (status === "in_progress") {
        return "In Progress";
    }

    return "Captured";
}

function CaptureIdeaDialog({
    form,
    isPending,
    onChange,
    onClose,
    onSubmit,
}: {
    form: CaptureFormState;
    isPending: boolean;
    onChange: <Key extends keyof CaptureFormState>(
        key: Key,
        value: CaptureFormState[Key],
    ) => void;
    onClose: () => void;
    onSubmit: (event: FormSubmitEvent) => void;
}) {
    return (
        <div className="absolute inset-0 z-20 grid place-items-center bg-background/72 p-3 backdrop-blur-sm">
            <form
                onSubmit={onSubmit}
                className="max-h-[92%] w-full max-w-2xl overflow-y-auto border border-border bg-card shadow-2xl [scroll-behavior:auto] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                    <div className="space-y-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Capture idea
                        </p>
                        <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                            Create an idea
                        </h3>
                        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                            Draft quickly now, then refine the details,
                            progress, and features in your workspace.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close capture form"
                        className="flex size-9 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </header>

                <div className="grid gap-4 px-5 py-5">
                    <label className="grid gap-2">
                        <span className="text-sm font-medium text-foreground">
                            Idea title
                        </span>
                        <input
                            value={form.title}
                            onChange={(event) =>
                                onChange("title", event.target.value)
                            }
                            placeholder="Give your idea a clear, short title"
                            className="h-12 border border-input bg-background/70 px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                            autoFocus
                        />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <span className="text-sm font-medium text-foreground">
                                Status
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {
                                        value: "draft",
                                        label: "Draft",
                                        icon: FilePenLine,
                                    },
                                    {
                                        value: "in_progress",
                                        label: "In progress",
                                        icon: Clock3,
                                    },
                                    {
                                        value: "submitted",
                                        label: "Submitted",
                                        icon: Send,
                                    },
                                    {
                                        value: "published",
                                        label: "Published",
                                        icon: Globe2,
                                    },
                                ].map(({ icon: Icon, label, value }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            onChange(
                                                "status",
                                                value as CaptureFormState["status"],
                                            )
                                        }
                                        className={cn(
                                            "flex min-h-10 items-center justify-center gap-2 border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                                            form.status === value &&
                                                "border-primary/40 bg-secondary text-foreground",
                                        )}
                                    >
                                        <Icon className="size-3.5" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <span className="text-sm font-medium text-foreground">
                                Visibility
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {
                                        value: "private",
                                        label: "Private",
                                        icon: LockKeyhole,
                                    },
                                    {
                                        value: "public",
                                        label: "Public",
                                        icon: Globe2,
                                    },
                                ].map(({ icon: Icon, label, value }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            onChange(
                                                "visibility",
                                                value as CaptureFormState["visibility"],
                                            )
                                        }
                                        className={cn(
                                            "flex min-h-10 items-center justify-center gap-2 border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                                            form.visibility === value &&
                                                "border-primary/40 bg-secondary text-foreground",
                                        )}
                                    >
                                        <Icon className="size-3.5" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    onChange(
                                        "allowComments",
                                        !form.allowComments,
                                    )
                                }
                                className={cn(
                                    "flex items-center justify-between gap-3 border border-border bg-secondary/50 px-4 py-2.5 text-left text-sm text-secondary-foreground transition-colors hover:border-primary/35",
                                    form.allowComments && "border-primary/35",
                                )}
                            >
                                <span>Allow comments</span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                                    {form.allowComments ? "on" : "off"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                        Saved locally into this dashboard preview.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !form.title.trim()}
                        >
                            <span>
                                {isPending ? "Saving..." : "Create idea"}
                            </span>
                        </Button>
                    </div>
                </footer>
            </form>
        </div>
    );
}

function OverviewPage({
    ideas,
    recentIdeas,
    topTubs,
}: {
    ideas: Idea[];
    recentIdeas: Idea[];
    topTubs: Idea[];
}) {
    return (
        <>
            <section className="grid gap-4 xl:grid-cols-[1.45fr_1.05fr]">
                <PanelCard title="Ideas Overview" action="View full report">
                    <OverviewChart />
                </PanelCard>

                <PanelCard title="Tub Health" action="Manage tubs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <DonutChart total={ideas.length} />
                        <div className="grid min-w-0 flex-1 gap-3">
                            <HealthRow
                                color="bg-[var(--color-chart-1)]"
                                label="active"
                                value="2 (40%)"
                            />
                            <HealthRow
                                color="bg-[oklch(0.8_0.15_85)]"
                                label="stale"
                                value="3 (60%)"
                            />
                            <HealthRow
                                color="bg-[oklch(0.78_0.015_260)]"
                                label="archived"
                                value="0 (0%)"
                            />
                        </div>
                    </div>
                </PanelCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <RecentIdeasPanel ideas={recentIdeas} />
                <TasksDuePanel />
                <ActivityPanel />
                <TopTubsPanel ideas={topTubs} />
            </section>
            <section>
                <StatusBreakdownPanel />
            </section>
        </>
    );
}

function ProjectsPage({ ideas, topTubs }: { ideas: Idea[]; topTubs: Idea[] }) {
    const columns = [
        {
            title: "Planned",
            items: ideas.filter((idea) => idea.status === "Captured"),
        },
        {
            title: "Ongoing",
            items: ideas.filter((idea) =>
                ["In Tub", "In Progress", "Ready to Publish"].includes(
                    idea.status,
                ),
            ),
        },
        {
            title: "Completed",
            items: ideas.filter((idea) => idea.status === "Published"),
        },
    ];

    return (
        <>
            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <PanelCard title="Active Idea Tubs" action="New tub">
                    <div className="grid gap-3 lg:grid-cols-3">
                        {columns.map((column) => (
                            <div
                                key={column.title}
                                className="border border-border bg-background/62"
                            >
                                <div className="border-b border-border px-3 py-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        {column.title}
                                    </p>
                                </div>
                                <div className="grid gap-2 p-2">
                                    {column.items.length > 0 ? (
                                        column.items.map((idea) => (
                                            <div
                                                key={idea.title}
                                                className="border border-border bg-card/86 p-3"
                                            >
                                                <p className="line-clamp-1 text-sm font-medium text-foreground">
                                                    {idea.title}
                                                </p>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {idea.tasks} tasks ·{" "}
                                                    {idea.comments} comments
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="border border-dashed border-border p-4 text-xs text-muted-foreground">
                                            Nothing here yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </PanelCard>
                <TopTubsPanel ideas={topTubs} />
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <PanelCard title="Tub Health">
                    <div className="grid gap-3">
                        <HealthRow
                            color="bg-[var(--color-chart-1)]"
                            label="active"
                            value="2 (40%)"
                        />
                        <HealthRow
                            color="bg-[oklch(0.8_0.15_85)]"
                            label="stale"
                            value="3 (60%)"
                        />
                        <HealthRow
                            color="bg-[oklch(0.78_0.015_260)]"
                            label="archived"
                            value="0 (0%)"
                        />
                    </div>
                </PanelCard>
                <PanelCard title="Project Signals">
                    <div className="grid gap-3">
                        {[
                            "2 tubs updated today",
                            "1 tub ready to publish",
                            "4 tasks need review",
                        ].map((item) => (
                            <div
                                key={item}
                                className="border border-border bg-background/70 px-3 py-3 text-sm text-foreground"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </PanelCard>
                <ActivityPanel />
            </section>
        </>
    );
}

function IdeasPage({
    captureIdea,
    ideas,
}: {
    captureIdea: () => void;
    ideas: Idea[];
}) {
    return (
        <>
            <section className="grid gap-4 xl:grid-cols-[1fr_0.75fr]">
                <PanelCard title="Idea Library" action="New idea">
                    <div className="grid gap-3">
                        {ideas.map((idea) => (
                            <button
                                key={idea.title}
                                type="button"
                                className="grid gap-3 border border-border bg-background/70 p-3 text-left transition-colors hover:border-primary/35 hover:bg-secondary/40 md:grid-cols-[1fr_auto_auto]"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {idea.title}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {idea.workspace} · updated{" "}
                                        {idea.updated}
                                    </p>
                                </div>

                                <span className="text-xs text-muted-foreground flex flex-col items-end">
                                    <StatusBadge label={idea.status} />
                                    <span className="mt-1">
                                        {idea.comments} comments
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </PanelCard>
                <StatusBreakdownPanel />
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                <RecentIdeasPanel ideas={ideas.slice(0, 4)} />
                <PanelCard title="Publishing Queue">
                    <div className="grid gap-3">
                        {ideas
                            .filter((idea) =>
                                ["Ready to Publish", "Published"].includes(
                                    idea.status,
                                ),
                            )
                            .map((idea) => (
                                <div
                                    key={idea.title}
                                    className="border border-border bg-background/70 p-3"
                                >
                                    <p className="text-sm font-medium text-foreground">
                                        {idea.title}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {idea.status}
                                    </p>
                                </div>
                            ))}
                    </div>
                </PanelCard>
                <PanelCard title="Quick Actions">
                    <QuickAction
                        icon={Lightbulb}
                        title="Capture a new idea"
                        onClick={captureIdea}
                    />
                </PanelCard>
            </section>
        </>
    );
}

function TasksPage() {
    const taskColumns = [
        {
            title: "Planned",
            items: tasks.filter((task) => task.status === "planned"),
        },
        {
            title: "Ongoing",
            items: tasks.filter((task) => task.status === "ongoing"),
        },
        {
            title: "Completed",
            items: [
                {
                    title: "Draft first tub outline",
                    due: "Done yesterday",
                    status: "completed",
                },
            ] satisfies Task[],
        },
    ];

    return (
        <>
            <section className="grid gap-4 xl:grid-cols-3">
                {taskColumns.map((column) => (
                    <PanelCard key={column.title} title={column.title}>
                        <div className="grid gap-3">
                            {column.items.map((task) => (
                                <div
                                    key={task.title}
                                    className="grid grid-cols-[auto_1fr_auto] gap-3 border border-border bg-background/70 p-3"
                                >
                                    <span className="mt-1 size-3 border border-border bg-card" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {task.title}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {task.due}
                                        </p>
                                    </div>
                                    <StatusPill label={task.status} />
                                </div>
                            ))}
                        </div>
                    </PanelCard>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <TasksDuePanel />
                <PanelCard title="Task Velocity">
                    <div className="grid gap-4">
                        {[
                            ["Completed", "8", "w-4/5"],
                            ["Shared", "3", "w-1/3"],
                            ["Due soon", "4", "w-1/2"],
                        ].map(([label, value, width]) => (
                            <div key={label} className="grid gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {label}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {value}
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary">
                                    <div
                                        className={cn(
                                            "h-full bg-primary",
                                            width,
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </PanelCard>
            </section>
        </>
    );
}

function TimePage() {
    return (
        <>
            <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <PanelCard title="Focus Timer" action="Start session">
                    <div className="grid gap-4 text-center">
                        <div className="mx-auto flex size-48 items-center justify-center border border-primary/25 bg-secondary/55">
                            <div>
                                <p className="text-5xl font-semibold tracking-tight text-foreground">
                                    25:00
                                </p>
                                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                                    Ready to focus
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {["Plan", "Refine", "Publish"].map((label) => (
                                <div
                                    key={label}
                                    className="border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground"
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </PanelCard>
                <PanelCard title="Weekly Time">
                    <OverviewChart />
                </PanelCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
                {[
                    ["Today", "1h 20m", "Drafted Hello Moto tasks"],
                    ["Yesterday", "42m", "Reviewed public idea comments"],
                    ["This week", "5h 10m", "Moved 3 ideas forward"],
                ].map(([label, value, copy]) => (
                    <PanelCard key={label} title={label}>
                        <p className="text-4xl font-semibold text-foreground">
                            {value}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {copy}
                        </p>
                    </PanelCard>
                ))}
            </section>
        </>
    );
}

function RecentIdeasPanel({ ideas }: { ideas: Idea[] }) {
    return (
        <PanelCard title="Recent Ideas" action="View all ideas">
            <div className="grid gap-4">
                {ideas.map((idea) => (
                    <div
                        key={idea.title}
                        className="grid gap-1 border-b border-border/70 pb-4 last:border-b-0 last:pb-0"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-1 text-sm font-medium text-foreground">
                                {idea.title}
                            </p>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {idea.updated}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <InlineMeta>untagged</InlineMeta>
                            <span>in</span>
                            <span>{idea.workspace}</span>
                        </div>
                    </div>
                ))}
            </div>
        </PanelCard>
    );
}

function TasksDuePanel() {
    return (
        <PanelCard title="Tasks Due Soon" action="View all tasks">
            <div className="grid gap-4">
                {tasks.map((task) => (
                    <div
                        key={task.title}
                        className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-border/70 pb-4 last:border-b-0 last:pb-0"
                    >
                        <span className="mt-1 size-3 border border-border bg-background" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {task.due}
                            </p>
                        </div>
                        <StatusPill label={task.status} />
                    </div>
                ))}
            </div>
        </PanelCard>
    );
}

function ActivityPanel() {
    return (
        <PanelCard title="Activity Feed" action="View all activity">
            <div className="grid gap-4">
                {[
                    {
                        title: "Updated an idea space",
                        subtitle: "Hello Moto",
                        time: "yesterday",
                        icon: Lightbulb,
                    },
                    {
                        title: "Published an idea",
                        subtitle: "Winter offensive cases",
                        time: "5 days ago",
                        icon: Globe2,
                    },
                ].map(({ icon: Icon, subtitle, time, title }) => (
                    <div
                        key={`${title}-${subtitle}`}
                        className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-border/70 pb-4 last:border-b-0 last:pb-0"
                    >
                        <div className="mt-1 flex size-5 items-center justify-center bg-secondary text-primary">
                            <Icon className="size-3.5" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm text-foreground">{title}</p>
                            <p className="text-xs text-muted-foreground">
                                {subtitle}
                            </p>
                        </div>
                        <span className="justify-self-end text-xs text-muted-foreground">
                            {time}
                        </span>
                    </div>
                ))}
            </div>
        </PanelCard>
    );
}

function TopTubsPanel({ ideas }: { ideas: Idea[] }) {
    return (
        <PanelCard title="Top Idea Tubs" action="View all tubs">
            <div className="grid gap-4">
                {ideas.map((idea, index) => (
                    <div
                        key={idea.title}
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
                                        width: `${Math.max(16, idea.tasks * 22)}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {idea.tasks} {idea.tasks === 1 ? "task" : "tasks"}
                        </span>
                    </div>
                ))}
            </div>
        </PanelCard>
    );
}

function StatusBreakdownPanel() {
    return (
        <PanelCard title="Ideas by Status" action="View full breakdown">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {statusBars.map(([label, value, width, color]) => (
                    <div key={label} className="grid gap-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-muted-foreground">
                                {label}
                            </span>
                            <span className="font-medium text-foreground">
                                {value}
                            </span>
                        </div>
                        <div className="h-2 bg-secondary/80">
                            <div className={cn("h-full", width, color)} />
                        </div>
                    </div>
                ))}
            </div>
        </PanelCard>
    );
}

function StatusBadge({ label }: { label: IdeaStatus }) {
    const tone =
        label === "Published"
            ? "bg-primary text-primary-foreground"
            : label === "Ready to Publish"
              ? "bg-[oklch(0.62_0.12_300_/_0.16)] text-primary"
              : "bg-secondary text-secondary-foreground";

    return (
        <span
            className={cn(
                "inline-flex w-fit items-center px-2 py-1 text-[11px] font-medium",
                tone,
            )}
        >
            {label}
        </span>
    );
}

function PanelCard({
    action,
    children,
    copy,
    title,
}: {
    action?: string;
    children: React.ReactNode;
    copy?: string;
    title: string;
}) {
    return (
        <article className="border border-border bg-card/92 shadow-sm">
            <header className="border-b border-border px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                            {title}
                        </h3>
                        {copy ? (
                            <p className="text-sm text-muted-foreground">
                                {copy}
                            </p>
                        ) : null}
                    </div>
                    {action ? (
                        <button
                            type="button"
                            className="inline-flex w-full items-center justify-center gap-2 border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary sm:w-auto"
                        >
                            {action}
                            <ArrowRight className="size-4" />
                        </button>
                    ) : null}
                </div>
            </header>
            <div className="px-4 pb-4 pt-4 sm:px-5">{children}</div>
        </article>
    );
}

function OverviewChart() {
    const toY = (value: number) => 144 - value * 36;
    const toX = (index: number) => 28 + index * 66;
    const capturedPath = overviewPoints
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.captured)}`,
        )
        .join(" ");
    const completedPath = overviewPoints
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.completed)}`,
        )
        .join(" ");
    const publishedPath = overviewPoints
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(point.published)}`,
        )
        .join(" ");

    return (
        <div className="h-52 w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <svg
                className="h-72 min-w-[460px] text-muted-foreground"
                viewBox="0 0 460 260"
            >
                {[0, 1, 2, 3].map((line) => (
                    <g key={line}>
                        <line
                            x1="28"
                            x2="424"
                            y1={toY(line)}
                            y2={toY(line)}
                            stroke="currentColor"
                            strokeOpacity="0.18"
                        />
                        <text
                            x="10"
                            y={toY(line) + 4}
                            fontSize="10"
                            fill="currentColor"
                        >
                            {line * 3}
                        </text>
                    </g>
                ))}
                <path
                    d={capturedPath}
                    fill="none"
                    stroke="var(--color-chart-1)"
                    strokeWidth="1.5"
                />
                <path
                    d={completedPath}
                    fill="none"
                    stroke="oklch(0.62 0.12 300)"
                    strokeWidth="1.5"
                />
                <path
                    d={publishedPath}
                    fill="none"
                    stroke="var(--color-chart-2)"
                    strokeWidth="1.5"
                />
                {overviewPoints.map((point, index) => (
                    <text
                        key={point.label}
                        x={toX(index)}
                        y="175"
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                    >
                        {point.label}
                    </text>
                ))}
            </svg>
        </div>
    );
}

function DonutChart({ total }: { total: number }) {
    return (
        <div className="relative mx-auto flex size-32 shrink-0 items-center justify-center sm:size-40">
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background:
                        "conic-gradient(oklch(0.8 0.15 85) 0 60%, var(--color-chart-1) 60% 100%)",
                }}
            />
            <div className="absolute inset-6 rounded-full bg-card sm:inset-8" />
            <p className="relative text-3xl font-semibold text-foreground sm:text-4xl">
                {total}
            </p>
        </div>
    );
}

function HealthRow({
    color,
    label,
    value,
}: {
    color: string;
    label: string;
    value: string;
}) {
    return (
        <div className="grid grid-cols-[auto_1fr] gap-3 border border-border bg-background/70 px-3 py-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <span className={cn("size-3 border border-border", color)} />
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-sm text-muted-foreground sm:text-right">
                {value}
            </span>
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

function StatusPill({ label }: { label: Task["status"] }) {
    return (
        <span className="inline-flex items-center bg-secondary px-2 py-1 text-[11px] font-medium capitalize text-secondary-foreground">
            {label}
        </span>
    );
}

function QuickAction({
    copy,
    icon: Icon,
    onClick,
    title,
}: {
    copy?: string;
    icon: typeof Lightbulb;
    onClick?: () => void;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="grid grid-cols-[auto_1fr] gap-3 border border-border bg-background/72 p-3 text-left transition-colors hover:border-primary/35 hover:bg-secondary/40"
        >
            <div className="flex size-8 items-center justify-center bg-secondary text-primary">
                <Icon className="size-4" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {copy}
                </p>
            </div>
        </button>
    );
}
