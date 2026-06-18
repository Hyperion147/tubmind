"use client";

import type { ComponentType } from "react";
import { motion } from "motion/react";

import { ChartNetworkIcon } from "@/components/ui/chart-network-icon";
import { FolderOpenIcon } from "@/components/ui/folder-open-icon";
import { GlobeIcon } from "@/components/ui/globe-icon";
import { LockIcon } from "@/components/ui/lock-icon";
import { MessageCircleIcon } from "@/components/ui/message-circle-icon";
import { RocketIcon } from "@/components/ui/rocket-icon";
import { ShieldUserIcon } from "@/components/ui/shield-user-icon";
import { SparklesIcon } from "@/components/ui/sparkles-icon";

type AnimatedTrustIcon = ComponentType<{
    className?: string;
    duration?: number;
    loop?: boolean;
    size?: number;
}>;

const trustItems = [
    {
        title: "Private by default",
        detail: "Drafts stay yours",
        icon: LockIcon,
    },
    {
        title: "Structured detail",
        detail: "Notes become usable",
        icon: FolderOpenIcon,
    },
    {
        title: "Publish when ready",
        detail: "Share only the best",
        icon: RocketIcon,
    },
    {
        title: "Authenticated discussion",
        detail: "Real reactions",
        icon: ShieldUserIcon,
    },
    {
        title: "Idea workflows",
        detail: "Capture to launch",
        icon: ChartNetworkIcon,
    },
    {
        title: "Public listings",
        detail: "Clean idea pages",
        icon: GlobeIcon,
    },
    {
        title: "Focused feedback",
        detail: "Comments in context",
        icon: MessageCircleIcon,
    },
    {
        title: "Clear signal",
        detail: "Find what matters",
        icon: SparklesIcon,
    },
] satisfies {
    title: string;
    detail: string;
    icon: AnimatedTrustIcon;
}[];

const carouselItems = [...trustItems, ...trustItems];

export function LandingStrip() {
    return (
        <section className="relative w-full overflow-hidden border-y border-primary/12 bg-[color-mix(in_oklch,var(--accent)_16%,var(--background))] py-3 text-left shadow-[0_-1px_0_color-mix(in_oklch,var(--background)_80%,transparent)_inset,0_1px_0_color-mix(in_oklch,var(--background)_80%,transparent)_inset] md:mt-[-3.5rem]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
            />

            <div className="flex w-full items-center gap-4 px-4 md:px-6">
                <div className="min-w-0 flex-1 overflow-hidden">
                    <motion.div
                        className="flex w-max items-center gap-3 will-change-transform"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            duration: 26,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                    >
                        {carouselItems.map((item, index) => (
                            <TrustCarouselItem
                                key={`${item.title}-${index}`}
                                {...item}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function TrustCarouselItem({
    detail,
    icon: Icon,
    title,
}: {
    detail: string;
    icon: AnimatedTrustIcon;
    title: string;
}) {
    return (
        <article className="flex min-w-64 items-center gap-3 bg-card/72 px-4 py-3 backdrop-blur-sm shadow-2xs shadow-accent">
            <div className="flex size-9 shrink-0 items-center justify-center text-primary shadow-[inset_0_1px_0_color-mix(in_oklch,var(--background)_80%,transparent)]">
                <Icon duration={1.2} loop size={16} />
            </div>
            <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">
                    {title}
                </h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {detail}
                </p>
            </div>
        </article>
    );
}
