"use client";

import {
    CalendarRange,
    Clock3,
    FilePenLine,
    FolderKanban,
    Lightbulb,
    ListTodo,
    Play,
    Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
    ChevronRightIcon,
    type ChevronRightIconHandle,
} from "@/components/ui/chevron-right-icon";
import { cn } from "@/lib/utils";

const dashboardStats = [
    ["Ideas", "12", "+ 3 new"],
    ["Projects", "4", "+ 1 active"],
    ["Tasks", "9", "+ 2 ongoing"],
] as const;

const dashboardNav = [Lightbulb, FolderKanban, FilePenLine, ListTodo, Clock3];
const chartPath = "M 0 58 C 26 42 45 48 70 32 C 94 16 112 36 138 18 C 162 2 174 14 194 0";

export function LandingAppAccessCta() {
    const prefersReducedMotion = useReducedMotion();
    const portfolioIconRef = useRef<ChevronRightIconHandle | null>(null);

    return (
        <section
            id="app"
            className="relative mt-20 scroll-mt-28 overflow-hidden border border-border bg-[color-mix(in_oklch,var(--accent)_18%,var(--background))] text-left md:scroll-mt-32 px-12"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_8%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_32%),linear-gradient(90deg,color-mix(in_oklch,var(--background)_74%,transparent),transparent_58%)]"
            />

            <div className="grid items-center gap-6 lg:grid-cols-[1.25fr_0.9fr]">
                <DashboardPreview prefersReducedMotion={prefersReducedMotion} />

                <div className="relative px-2 py-3 md:px-5">
                    <motion.svg
                        aria-hidden="true"
                        className="absolute right-3 top-0 hidden h-28 w-44 text-primary/45 md:block"
                        viewBox="0 0 180 100"
                        fill="none"
                        initial={false}
                        animate={
                            prefersReducedMotion
                                ? undefined
                                : { x: [0, 8, 0], y: [0, -4, 0] }
                        }
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <path
                            d="M8 48 C42 18 54 82 82 48 C114 10 126 80 172 18"
                            stroke="currentColor"
                            strokeDasharray="5 6"
                            strokeLinecap="round"
                            strokeWidth="1.6"
                        />
                    </motion.svg>

                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                        Experience the dashboard
                    </p>
                    <h2 className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
                        See how it all comes together.
                    </h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                        Explore your tubs, ideas, tasks, and progress in a calm
                        workspace built for moving rough thoughts into finished
                        ideas.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Button asChild className="shadow-[3px_3px_0_0_var(--color-border)]">
                            <a href="https://app.tubmind.space">
                                <span>Try the dashboard</span>
                                <Play className="size-3.5" />
                            </a>
                        </Button>
                        <a
                            href="https://suryansu.pro/"
                            target="_blank"
                            rel="noreferrer"
                            onBlur={() => portfolioIconRef.current?.stopAnimation()}
                            onFocus={() => portfolioIconRef.current?.startAnimation()}
                            onMouseEnter={() =>
                                portfolioIconRef.current?.startAnimation()
                            }
                            onMouseLeave={() =>
                                portfolioIconRef.current?.stopAnimation()
                            }
                            className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                        >
                            Visit My Portfolio
                            <ChevronRightIcon
                                ref={portfolioIconRef}
                                isAnimated={false}
                            />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

function DashboardPreview({
    prefersReducedMotion,
}: {
    prefersReducedMotion: boolean | null;
}) {
    return (
        <div
            className="relative overflow-hidden border border-border bg-card/86 shadow-[12px_16px_36px_-28px_color-mix(in_oklch,var(--foreground)_42%,transparent)] md:min-h-64 transform-3d translate-y-12 -rotate-2 pointer-events-none"
        >
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,color-mix(in_oklch,var(--primary)_6%,transparent)_45%,transparent_72%)]" />
            <div className="relative grid min-h-52 grid-cols-[3.5rem_1fr] md:min-h-40">
                <aside className="border-r border-border bg-card/92 p-2">
                    <div className="grid gap-2">
                        {dashboardNav.map((Icon, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex size-8 items-center justify-center border border-border bg-background/70 text-muted-foreground",
                                    index === 0 &&
                                        "border-primary/40 bg-secondary text-primary shadow-[3px_3px_0_0_var(--color-border)]",
                                )}
                            >
                                <Icon className="size-3.5" />
                            </div>
                        ))}
                    </div>
                </aside>

                <div className="p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">
                                Dashboard
                            </h3>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Here&apos;s what is happening with your ideas
                                today.
                            </p>
                        </div>
                        <div className="hidden items-center gap-1 border border-border bg-background/70 px-2 py-1 text-[10px] text-muted-foreground sm:inline-flex">
                            <CalendarRange className="size-3" />
                            Last 7 days
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                        {dashboardStats.map(([label, value, delta]) => (
                            <div
                                key={label}
                                className="border border-border bg-background/70 p-3 shadow-sm"
                            >
                                <p className="text-[10px] text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-2 text-xl font-semibold text-foreground">
                                    {value}
                                </p>
                                <p className="mt-2 text-[10px] text-primary">
                                    {delta}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.2fr]">
                        <div className="border border-border bg-background/70 p-3">
                            <p className="text-[10px] text-muted-foreground">
                                Today&apos;s focus
                            </p>
                            <div className="mt-3 grid gap-2">
                                {["Capture", "Organize", "Publish"].map(
                                    (item, index) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-2 text-[10px] text-foreground"
                                        >
                                            <span
                                                className={cn(
                                                    "size-2 bg-secondary",
                                                    index === 0 &&
                                                        "bg-primary",
                                                )}
                                            />
                                            {item}
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="border border-border bg-background/70 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground">
                                    Projects over time
                                </p>
                                <Sparkles className="size-3.5 text-primary" />
                            </div>
                            <svg
                                className="h-20 w-full overflow-visible text-primary"
                                viewBox="0 0 194 62"
                                fill="none"
                            >
                                <path
                                    d={chartPath}
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="2"
                                />
                                <path
                                    d={`${chartPath} L 194 62 L 0 62 Z`}
                                    fill="currentColor"
                                    opacity="0.08"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
