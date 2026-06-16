"use client";

import {
    CheckCircle2,
    Clock3,
    FolderOpen,
    GalleryHorizontal,
    Heart,
    ImageIcon,
    LockKeyhole,
    MessageSquare,
    Mic,
    MountainSnow,
    ShieldCheck,
    ShieldCheckIcon,
    Type,
    User,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { useHydrated } from "@/hooks/use-hydrated";

const featurePanels = [
    {
        step: "01",
        title: "Private capture by default with Google sign-in.",
        chip: "Your ideas stay private by default",
        stage: "Capture privately",
        visual: "capture",
        icon: LockKeyhole,
    },
    {
        step: "02",
        title: "Rich idea pages, tasks tub and timeline management.",
        chip: "Structured, context-rich, actionable",
        stage: "Build with structure",
        visual: "structure",
        icon: FolderOpen,
    },
    {
        step: "03",
        title: "Public listings with reactions, comments and moderation.",
        chip: "Safe, quality discussions that scale",
        stage: "Share with confidence",
        visual: "share",
        icon: ShieldCheck,
    },
] as const;

type FeaturePanelItem = (typeof featurePanels)[number];
type FeatureVisual = FeaturePanelItem["visual"];

const ease = [0.22, 1, 0.36, 1] as const;

export function LandingFeaturePanels() {
    return (
        <section className="mt-20 w-full border border-border bg-card/72 text-left backdrop-blur px-4 md:px-8 py-8">
            <div className="mx-auto text-start w-full">
                <Badge className="font-mono text-[10px] bg-background uppercase text-foreground">
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
    const isHydrated = useHydrated();
    const prefersReducedMotion = useReducedMotion();
    const shouldReduceMotion = isHydrated && prefersReducedMotion;
    const Icon = item.icon;

    return (
        <motion.article
            animate="rest"
            className="group relative grid h-full grid-rows-[13.5rem_minmax(0,1fr)_auto] overflow-hidden border border-border bg-background/64 p-4 transition-colors duration-300 hover:bg-card/86"
            initial="rest"
            transition={{ duration: 0.45, ease }}
            whileHover={shouldReduceMotion ? undefined : "hover"}
        >
            <div className="absolute left-4 top-4 flex size-9 items-center justify-center bg-secondary text-sm font-semibold text-primary">
                {item.step}
            </div>

            <div className="flex h-full items-center pt-8">
                <FeatureVisualStudy type={item.visual} />
            </div>

            <h3 className="text-xl font-semibold text-foreground">
                {item.title}
            </h3>

            <div className="mt-4 inline-flex max-w-full items-center gap-2 self-end bg-secondary/80 px-3 py-2 text-xs font-medium text-primary">
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate">{item.chip}</span>
            </div>
        </motion.article>
    );
}

function FeatureVisualStudy({ type }: { type: FeatureVisual }) {
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
        <div className="relative h-full w-full">
            <div className="absolute left-0 top-6 h-[70%] w-[52%] border border-border bg-background">
                <div className="absolute left-[10%] top-[14%] h-1 w-[34%] bg-primary" />
                <div className="absolute left-[10%] top-[24%] h-1 w-[64%] bg-muted" />
                <div className="absolute left-[10%] top-[34%] h-1 w-[52%] bg-muted" />
                <div className="absolute left-[10%] top-[44%] h-1 w-[62%] bg-accent" />

                <div className="absolute bottom-3 left-[8%] grid w-[84%] grid-cols-3 gap-3">
                    <CaptureToolButton>
                        <Type className="size-4" />
                    </CaptureToolButton>
                    <CaptureToolButton>
                        <Mic className="size-4" />
                    </CaptureToolButton>
                    <CaptureToolButton>
                        <ImageIcon className="size-4" />
                    </CaptureToolButton>
                </div>
            </div>

            <div className="absolute left-[54%] top-1/2 h-px w-[27%] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--color-primary)_0_9px,transparent_9px_20px)]" />
            <div className="absolute right-0 top-1/2 grid size-16 rounded-full -translate-y-1/2 place-items-center bg-secondary">
                <span className="absolute -left-[20%] -top-[12%] text-primary/35">
                    ✦
                </span>
                <span className="absolute right-[6%] -top-[36%] text-primary/35">
                    ✦
                </span>
                <span className="absolute -bottom-[32%] right-[22%] text-primary/35">
                    ✦
                </span>
                <div className="grid size-12 place-items-center border border-black rounded-full">
                    <LockKeyhole
                        className="size-6 text-foreground/80"
                        strokeWidth={2}
                    />
                </div>
            </div>
        </div>
    );
}

function StructureVisual() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-x-0 top-4 mx-auto h-[85%] overflow-hidden border border-border bg-background">
                <div className="flex h-8 items-center gap-1.5 border-b border-border px-4">
                    <span className="size-2 bg-primary" />
                    <span className="size-2 bg-primary" />
                    <span className="size-2 bg-primary" />
                </div>
                <div className="grid grid-cols-[1fr_0.32fr]">
                    <div className="grid grid-cols-[0.35fr_1fr] gap-4 px-4 py-2">
                        <div className="flex items-center justify-center w-16 h-16 bg-secondary">
                            <MountainSnow className="size-12 text-primary" />
                        </div>
                        <div className="space-y-3 pt-2">
                            <div className="h-1.5 w-16 bg-primary" />
                            <div className="h-1 w-28 bg-muted" />
                            <div className="h-1 w-24 bg-muted" />
                            <div className="h-1 w-24 bg-muted" />
                        </div>
                    </div>
                    <div className="space-y-4 border-l border-border p-4">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <span className="size-2 border-2 border-primary" />
                                <span className="h-1 w-10 bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-x-0 -bottom-0 grid grid-cols-3 gap-2 border-t border-border bg-background p-2">
                    <IdeaTab
                        label="Notes"
                        icon={<FolderOpen className="size-4" />}
                    />
                    <IdeaTab
                        label="Tasks"
                        icon={<CheckCircle2 className="size-4" />}
                    />
                    <IdeaTab
                        label="Timeline"
                        icon={<Clock3 className="size-4" />}
                    />
                </div>
            </div>
        </div>
    );
}

function ShareVisual() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute left-[12%] top-[12%] h-[72%] w-[72%] rounded-[70%] border border-dashed border-muted-foreground/45" />
            <span className="absolute left-[9%] top-[24%] text-primary/35">
                ✦
            </span>
            <span className="absolute right-[6%] top-[30%] text-primary/35">
                ✦
            </span>
            <span className="absolute bottom-[2%] right-[22%] text-primary/35">
                ✦
            </span>
            <AvatarBubble className="right-[25%] top-2" />
            <AvatarBubble className="left-[6%] bottom-[24%]" />

            <CommentPreview
                className="left-[22%] top-[26%] w-[66%]"
                action="heart"
            />
            <CommentPreview
                className="left-[24%] top-[62%] w-[66%]"
                action="message"
            />
        </div>
    );
}

function CaptureToolButton({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid aspect-square place-items-center border border-border bg-background text-primary">
            {children}
        </div>
    );
}

function IdeaTab({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex h-6 items-center justify-center gap-2 border border-border bg-background text-xs text-foreground">
            <span>{label}</span>
            <span className="text-primary">{icon}</span>
        </div>
    );
}

function AvatarBubble({ className }: { className?: string }) {
    return (
        <div
            className={`absolute border border-primary/25 bg-background ${className ?? ""}`}
        >
            <ShieldCheckIcon className="size-8 p-1.5" />
        </div>
    );
}

function CommentPreview({
    action,
    className,
}: {
    action: "heart" | "message";
    className?: string;
}) {
    return (
        <div
            className={`absolute grid grid-cols-[auto_1fr_auto] items-center gap-2 border border-border bg-background p-2 shadow-sm ${className ?? ""}`}
        >
            <div className="grid  place-items-center bg-muted">
                <User className="size-8 p-1.5" />
            </div>
            <div className="space-y-2">
                <div className="h-1 w-18 bg-muted-foreground/35" />
                <div className="h-1 w-20 bg-muted-foreground/25" />
                <div className="h-1 w-12 bg-muted" />
            </div>
            {action === "heart" ? (
                <div className="bg-primary text-primary-foreground rounded-full">
                    <Heart className="size-7 p-1.5" fill="currentColor" />
                </div>
            ) : (
                <div className="text-foreground bg-accent">
                    <MessageSquare className="size-7 p-1.5" />
                </div>
            )}
        </div>
    );
}
