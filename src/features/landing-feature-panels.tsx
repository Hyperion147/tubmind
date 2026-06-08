"use client";

import {
    FolderOpen,
    LockKeyhole,
    MessageSquare,
    ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";

const featurePanels = [
    {
        step: "01",
        title: "Private capture with Google sign-in",
        description:
            "Save rough thoughts quickly, then keep them in a private workspace that starts with Google sign-in.",
        chip: "Your ideas stay private by default",
        stage: "Capture privately",
        visual: "capture",
        icon: LockKeyhole,
    },
    {
        step: "02",
        title: "Rich idea pages",
        description:
            "Track summaries, notes, features, and structure in one focused place instead of scattered notes.",
        chip: "Structured, context-rich, and actionable",
        stage: "Build with structure",
        visual: "structure",
        icon: FolderOpen,
    },
    {
        step: "03",
        title: "Public listings and moderation",
        description:
            "Publish the strongest ideas for reactions and discussion, while admin tools help moderate users, ideas, and comments during beta.",
        chip: "Safe, quality discussions that scale",
        stage: "Share with confidence",
        visual: "share",
        icon: ShieldCheck,
    },
] as const;

type FeaturePanelItem = (typeof featurePanels)[number];
type FeatureVisual = FeaturePanelItem["visual"];

const ease = [0.22, 1, 0.36, 1] as const;

const drawVariants = {
    rest: { pathLength: 0.001, opacity: 0.22 },
    hover: { pathLength: 1, opacity: 1 },
} as const;

const quietLineVariants = {
    rest: { opacity: 0.5 },
    hover: { opacity: 0.86 },
} as const;

export function LandingFeaturePanels() {
    return (
        <section className="mt-20 w-full border border-border bg-card/72 text-left shadow-[0_24px_70px_-56px_color-mix(in_oklch,var(--foreground)_44%,transparent)] backdrop-blur px-4 md:px-8 py-8">
            <div className="mx-auto text-start w-full">
                <Badge className="font-mono text-[10px] bg-background uppercase text-primary">
                    Built for the whole journey
                </Badge>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                    Everything you need to take ideas further
                </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {featurePanels.map((item) => (
                    <FeaturePanel key={item.title} item={item} />
                ))}
            </div>
        </section>
    );
}

function FeaturePanel({ item }: { item: FeaturePanelItem }) {
    const prefersReducedMotion = useReducedMotion();
    const Icon = item.icon;

    return (
        <motion.article
            animate="rest"
            className="group relative grid h-full grid-rows-[13.5rem_minmax(0,1fr)_auto] overflow-hidden border border-border bg-background/64 p-4 shadow-sm transition-colors duration-300 hover:bg-card/86"
            initial="rest"
            transition={{ duration: 0.45, ease }}
            whileHover={prefersReducedMotion ? undefined : "hover"}
        >
            <div className="absolute left-4 top-4 flex size-9 items-center justify-center bg-secondary text-sm font-semibold text-primary">
                {item.step}
            </div>

            <div className="flex h-full items-center pt-4">
                <FeatureVisualStudy type={item.visual} />
            </div>

            <div className="max-w-sm">
                <h3 className="text-xl font-semibold leading-7 text-foreground">
                    {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.description}
                </p>
            </div>

            <div className="mt-7 inline-flex max-w-full items-center gap-2 self-end bg-secondary/80 px-3 py-2 text-xs font-medium text-primary">
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate">{item.chip}</span>
            </div>
        </motion.article>
    );
}

function FeatureVisualStudy({
    type,
}: {
    type: FeatureVisual;
}) {
    if (type === "structure") {
        return <StructureVisual />;
    }

    if (type === "share") {
        return <ShareVisual />;
    }

    return <CaptureVisual />;
}

function CaptureVisual() {
    return (
        <motion.svg
            aria-hidden="true"
            className="h-full w-full text-foreground"
            fill="none"
            initial="rest"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 477 218"
        >
            <defs>
                <filter
                    id="private-capture-shadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                >
                    <feDropShadow
                        dx="0"
                        dy="10"
                        floodColor="currentColor"
                        floodOpacity="0.06"
                        stdDeviation="12"
                    />
                </filter>
                <linearGradient id="private-capture-card-fill" x1="31" x2="228" y1="14" y2="198">
                    <stop stopColor="var(--color-background)" />
                    <stop offset="1" stopColor="color-mix(in oklch, var(--color-background) 86%, var(--color-muted))" />
                </linearGradient>
                <radialGradient
                    id="private-capture-lock-glow"
                    cx="50%"
                    cy="50%"
                    r="50%"
                >
                    <stop
                        offset="0%"
                        stopColor="var(--color-primary)"
                        stopOpacity="0.13"
                    />
                    <stop
                        offset="62%"
                        stopColor="var(--color-primary)"
                        stopOpacity="0.08"
                    />
                    <stop
                        offset="100%"
                        stopColor="var(--color-primary)"
                        stopOpacity="0"
                    />
                </radialGradient>
            </defs>

            <motion.g
                stroke="currentColor"
                strokeOpacity="0.14"
                transition={{ duration: 0.45, ease }}
                variants={quietLineVariants}
            >
                <rect
                    x="31"
                    y="14"
                    width="198"
                    height="184"
                    rx="13"
                    fill="url(#private-capture-card-fill)"
                    filter="url(#private-capture-shadow)"
                />
                <path d="M48 68h149" strokeWidth="4" strokeLinecap="round" />
                <path d="M48 83h127" strokeWidth="4" strokeLinecap="round" />
                <path d="M48 98h103" strokeWidth="4" strokeLinecap="round" />
                <path d="M48 113h79" strokeWidth="4" strokeLinecap="round" />
                <rect x="45" y="138" width="42" height="42" rx="5" fill="var(--color-background)" />
                <rect x="108" y="138" width="42" height="42" rx="5" fill="var(--color-background)" />
                <rect x="171" y="138" width="42" height="42" rx="5" fill="var(--color-background)" />
            </motion.g>

            <motion.path
                d="M49 43c10 4 16-5 25-1 8 4 14-2 23-1 4 0 7 1 12-1"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeWidth="2"
                transition={{ duration: 0.9, ease }}
                variants={drawVariants}
            />

            <g className="text-primary">
                <path
                    d="M57 153h18M66 153v17"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.6"
                />
                <path
                    d="M129 151v10c0 4-3 7-7 7s-7-3-7-7v-10M122 169v5M116 174h12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                />
                <rect
                    x="186"
                    y="151"
                    width="16"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                />
                <path
                    d="m188 164 5-6 4 4 3-3 4 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                />
                <circle cx="191" cy="155" r="1.7" fill="currentColor" />
            </g>

            <motion.path
                d="M237 97h108"
                stroke="var(--color-primary)"
                strokeDasharray="9 10"
                strokeLinecap="round"
                strokeWidth="2.2"
                transition={{ duration: 0.8, ease, delay: 0.08 }}
                variants={drawVariants}
            />
            <motion.path
                d="m334 85 16 12-16 12"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                transition={{ duration: 0.45, ease, delay: 0.45 }}
                variants={drawVariants}
            />

            <g fill="var(--color-primary)" opacity="0.34">
                <path d="M327 48l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" />
                <path d="M352 143l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
            </g>

            <g>
                <circle cx="409" cy="97" r="57" fill="url(#private-capture-lock-glow)" />
                <circle
                    cx="409"
                    cy="97"
                    r="44"
                    fill="var(--color-secondary)"
                    opacity="0.45"
                    stroke="var(--color-primary)"
                    strokeOpacity="0.09"
                />
                <circle
                    cx="409"
                    cy="97"
                    r="32"
                    fill="var(--color-background)"
                    stroke="var(--color-border)"
                />
                <motion.rect
                    x="392"
                    y="98"
                    width="34"
                    height="27"
                    rx="5"
                    stroke="var(--color-foreground)"
                    strokeOpacity="0.72"
                    strokeWidth="2"
                    transition={{ duration: 0.45, ease, delay: 0.2 }}
                    variants={{
                        rest: { pathLength: 0.6 },
                        hover: { pathLength: 1 },
                    }}
                />
                <motion.path
                    d="M398 98V88c0-10 7-18 17-18s17 8 17 18v10"
                    stroke="var(--color-foreground)"
                    strokeOpacity="0.72"
                    strokeWidth="2"
                    transition={{ duration: 0.55, ease, delay: 0.28 }}
                    variants={drawVariants}
                />
                <circle
                    cx="409"
                    cy="111"
                    r="2.3"
                    fill="var(--color-foreground)"
                    opacity="0.72"
                />
                <path
                    d="M409 113v5"
                    stroke="var(--color-foreground)"
                    strokeLinecap="round"
                    strokeOpacity="0.72"
                />
            </g>
        </motion.svg>
    );
}

function StructureVisual() {
    return (
        <motion.svg
            aria-hidden="true"
            className="h-full w-full text-foreground"
            fill="none"
            initial="rest"
            viewBox="0 0 330 190"
        >
            <motion.g
                stroke="currentColor"
                strokeOpacity="0.17"
                transition={{ duration: 0.45, ease }}
                variants={quietLineVariants}
            >
                <rect x="48" y="28" width="234" height="136" rx="8" fill="var(--color-background)" />
                <path d="M48 52h234" />
                <path d="M224 52v112" />
                <circle cx="62" cy="40" r="3" fill="var(--color-primary)" stroke="none" />
                <circle cx="73" cy="40" r="3" fill="var(--color-primary)" stroke="none" />
                <circle cx="84" cy="40" r="3" fill="var(--color-primary)" stroke="none" />
                <path d="M104 78h96" />
                <path d="M104 96h82" />
                <path d="M104 114h68" />
                <path d="M238 74h28" />
                <path d="M238 92h28" />
                <path d="M238 110h28" />
            </motion.g>

            <g>
                <rect x="62" y="76" width="58" height="46" rx="5" fill="var(--color-secondary)" stroke="var(--color-border)" />
                <path d="m70 114 16-17 12 10 10-13 10 20z" fill="var(--color-primary)" opacity="0.34" />
                <circle cx="82" cy="90" r="5" stroke="var(--color-primary)" />
            </g>

            <motion.path
                d="M104 66h64"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeWidth="2"
                transition={{ duration: 0.75, ease }}
                variants={drawVariants}
            />
            <motion.path
                d="M238 74h5"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeWidth="2"
                transition={{ duration: 0.45, ease, delay: 0.15 }}
                variants={drawVariants}
            />
            <motion.path
                d="M238 92h5"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeWidth="2"
                transition={{ duration: 0.45, ease, delay: 0.25 }}
                variants={drawVariants}
            />
            <motion.path
                d="M238 110h5"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeWidth="2"
                transition={{ duration: 0.45, ease, delay: 0.35 }}
                variants={drawVariants}
            />

            <g className="text-foreground">
                {["Notes", "Tasks", "Timeline"].map((label, index) => (
                    <g key={label}>
                        <rect
                            x={60 + index * 58}
                            y="136"
                            width="50"
                            height="18"
                            rx="4"
                            fill="var(--color-background)"
                            stroke="var(--color-border)"
                        />
                        <text
                            x={85 + index * 58}
                            y="148"
                            fill="currentColor"
                            fontSize="8"
                            textAnchor="middle"
                        >
                            {label}
                        </text>
                        <motion.path
                            d={`M${70 + index * 58} 145h8`}
                            stroke="var(--color-primary)"
                            strokeLinecap="round"
                            transition={{
                                duration: 0.45,
                                ease,
                                delay: 0.22 + index * 0.08,
                            }}
                            variants={drawVariants}
                        />
                    </g>
                ))}
            </g>
        </motion.svg>
    );
}

function ShareVisual() {
    return (
        <motion.svg
            aria-hidden="true"
            className="h-full w-full text-foreground"
            fill="none"
            initial="rest"
            viewBox="0 0 330 190"
        >
            <motion.path
                d="M70 84c34-54 142-72 216-8 18 16 21 42 6 58-24 27-94 26-148 10-48-14-86-7-108 14"
                stroke="var(--color-primary)"
                strokeDasharray="5 6"
                strokeLinecap="round"
                strokeOpacity="0.36"
                transition={{ duration: 0.8, ease }}
                variants={drawVariants}
            />

            <CommentCard
                delay={0}
                x={82}
                y={48}
                width={200}
            />
            <CommentCard
                delay={0.12}
                x={110}
                y={112}
                width={176}
            />

            <Avatar cx={58} cy={108} tone="var(--color-chart-2)" />
            <Avatar cx={258} cy={36} tone="var(--color-chart-1)" />
            <Avatar cx={304} cy={138} tone="var(--color-chart-4)" />

            <g>
                <circle cx="260" cy="78" r="13" fill="var(--color-primary)" />
                <motion.path
                    d="m254 76 5 5 9-10"
                    stroke="var(--color-primary-foreground)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    transition={{ duration: 0.45, ease, delay: 0.3 }}
                    variants={{
                        rest: { pathLength: 0.35 },
                        hover: { pathLength: 1 },
                    }}
                />
            </g>

            <g className="text-foreground">
                <circle cx="250" cy="131" r="13" fill="var(--color-background)" stroke="var(--color-border)" />
                <MessageSquare className="size-4" x="242" y="123" />
            </g>
        </motion.svg>
    );
}

function CommentCard({
    delay,
    width,
    x,
    y,
}: {
    delay: number;
    width: number;
    x: number;
    y: number;
}) {
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height="52"
                rx="7"
                fill="var(--color-background)"
                stroke="var(--color-border)"
            />
            <circle cx={x + 20} cy={y + 20} r="9" fill="var(--color-muted)" />
            <motion.path
                d={`M${x + 40} ${y + 18}h78`}
                stroke="currentColor"
                strokeOpacity="0.2"
                transition={{ delay, duration: 0.55, ease }}
                variants={drawVariants}
            />
            <motion.path
                d={`M${x + 40} ${y + 34}h112`}
                stroke="currentColor"
                strokeOpacity="0.18"
                transition={{ delay: delay + 0.08, duration: 0.65, ease }}
                variants={drawVariants}
            />
        </g>
    );
}

function Avatar({ cx, cy, tone }: { cx: number; cy: number; tone: string }) {
    return (
        <g>
            <circle cx={cx} cy={cy} r="15" fill="var(--color-background)" stroke="var(--color-border)" />
            <circle cx={cx} cy={cy - 4} r="5" fill={tone} />
            <path d={`M${cx - 8} ${cy + 8}c2-8 14-8 16 0`} fill={tone} opacity="0.8" />
        </g>
    );
}
