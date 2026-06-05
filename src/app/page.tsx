import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppSmoothScroll } from "@/components/smooth-scroll";
import { Separator } from "@/components/ui/separator";
import { LandingBeforeAfterStrip } from "@/features/landing-before-after-strip";
import { LandingFeaturePanels } from "@/features/landing-feature-panels";
import LandingFooter from "@/features/landing-footer";
import { LandingGridBackground } from "@/features/landing-grid-background";
import { LandingReveal } from "@/features/landing-reveal";
import { LandingStagger } from "@/features/landing-stagger";
import { LandingStickyNavbar } from "@/features/landing-sticky-navbar";
import { LandingTrustRow } from "@/features/landing-trust-row";
import { LandingWorkflowLine } from "@/features/landing-workflow-line";
import { seoConfig } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Tubmind | Idea workspace",
    description:
        "Tubmind is a private idea-capture workspace for thoughts that strike anywhere, including in the bathroom. Sign in with Google, save rough ideas fast, refine them with notes, features, and structure, and publish the strongest ideas as public listings for reactions and discussion.",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: seoConfig.title,
        description: seoConfig.description,
        url: "/",
        images: [
            {
                url: seoConfig.ogImage,
                alt: seoConfig.ogImageAlt,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: seoConfig.title,
        description: seoConfig.description,
        images: [seoConfig.ogImage],
    },
};

const whyBuiltPoints = [
    "Ideas can strike anywhere, from a bathroom note to a quick thought on the go, and they are easy to lose if you do not capture them fast.",
    "I wanted one calm workspace where those fragments could become a useful plan without losing context.",
    "Tubmind keeps ideas private at first, then gives you a clean path to refine, publish, and discuss the strongest ones.",
];

export default function Home() {
    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
            <AppSmoothScroll />
            <LandingGridBackground />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--accent)_30%,white)_0%,transparent_72%)]" />

            <div className="relative z-10 mx-auto flex w-full max-w-400 flex-1 flex-col px-4 py-4 md:px-6 md:py-6">
                <LandingReveal
                    delay={0.02}
                    blur={12}
                    duration={0.55}
                    className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 md:px-6"
                >
                    <LandingStickyNavbar />
                </LandingReveal>

                <section
                    id="home"
                    className="relative mx-auto mt-40 flex w-full max-w-6xl flex-1 flex-col items-center justify-center pb-8 text-center md:pb-40"
                >
                    <LandingStagger
                        className="contents"
                        delay={0.1}
                        stagger={0.09}
                    >
                        <LandingReveal
                            inherit
                            delay={0}
                            y={16}
                            blur={10}
                            duration={0.55}
                        >
                            <Badge
                                variant="outline"
                                className="mb-6 px-4 py-1 font-mono"
                            >
                                Private idea capture for bathroom thoughts
                            </Badge>
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.2}
                            y={20}
                            blur={12}
                            duration={0.7}
                        >
                            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-normal text-balance text-foreground md:mt-6 md:text-6xl">
                                Capture thoughts from anywhere and turn them{" "}
                                <span className="text-primary">
                                    into useful ideas
                                </span>
                            </h1>
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.3}
                            y={18}
                            blur={10}
                            duration={0.62}
                            className="hidden md:flex"
                        >
                            <LandingWorkflowLine />
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.46}
                            y={18}
                            blur={10}
                            duration={0.62}
                            className="w-full"
                        >
                            <LandingBeforeAfterStrip />
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.52}
                            y={16}
                            blur={8}
                            duration={0.54}
                            className="w-full"
                        >
                            <LandingTrustRow />
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.8}
                            y={18}
                            blur={10}
                            duration={0.55}
                            className="w-full"
                        >
                            <LandingFeaturePanels />
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={1}
                            y={18}
                            blur={10}
                            duration={0.55}
                            className="w-full"
                        >
                            <section
                                id="why"
                                className="mt-10 scroll-mt-28 grid w-full gap-4 border border-border bg-card/84 p-5 text-left shadow-sm backdrop-blur md:scroll-mt-32 md:p-6 lg:grid-cols-[0.9fr_1.1fr]"
                            >
                                <div className="space-y-3">
                                    <Badge
                                        variant="outline"
                                        className="px-3 py-1 font-mono"
                                    >
                                        Why I built this
                                    </Badge>
                                    <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                                        Good ideas deserve more than a messy
                                        notes app.
                                    </h2>
                                    <p className="max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
                                        This project exists to make idea capture
                                        feel instant, then give it structure. It
                                        keeps early fragments, richer notes, and
                                        final planning in one place so the ideas
                                        become usable instead of lost.
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    {whyBuiltPoints.map((point, index) => (
                                        <div
                                            key={point}
                                            className="flex gap-3 bg-background/60 px-4 py-3 shadow-sm ring-1 ring-border/35"
                                        >
                                            <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>
                                            <p className="text-sm leading-7 text-muted-foreground">
                                                {point}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.56}
                            y={14}
                            blur={8}
                            duration={0.5}
                            className="w-full"
                        >
                            <div
                                id="app"
                                className="mt-10 scroll-mt-28 w-full max-w-6xl md:scroll-mt-32"
                            >
                                <Separator />
                                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-left">
                                    <div>
                                        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                            App access
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Open the product, sign in with
                                            Google, and keep organizing ideas in
                                            one place.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap">
                                        <Button asChild>
                                            <Link href="https://app.tubmind.space">
                                                Go to beta dashboard
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </LandingReveal>
                    </LandingStagger>
                </section>
            </div>
            <div className="relative z-10 w-full">
                <LandingFooter />
            </div>
        </main>
    );
}
