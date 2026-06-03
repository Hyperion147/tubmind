import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppSmoothScroll } from "@/components/smooth-scroll";
import { Separator } from "@/components/ui/separator";
import { LandingBeforeAfterStrip } from "@/features/home/components/landing-before-after-strip";
import { LandingFeaturePanels } from "@/features/home/components/landing-feature-panels";
import LandingFooter from "@/features/home/components/landing-footer";
import { LandingGridBackground } from "@/features/home/components/landing-grid-background";
import { LandingReveal } from "@/features/home/components/landing-reveal";
import { LandingStagger } from "@/features/home/components/landing-stagger";
import { LandingStickyNavbar } from "@/features/home/components/landing-sticky-navbar";
import { LandingTrustRow } from "@/features/home/components/landing-trust-row";
import { LandingWorkflowLine } from "@/features/home/components/landing-workflow-line";
import { seoConfig } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Capture bathroom design ideas from anywhere",
    description:
        "Capture bathroom design ideas from anywhere, turn scattered inspiration into a useful plan, and refine every detail in one calm workspace.",
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
    "Bathroom inspiration shows up everywhere: a photo, a voice memo, a half-remembered tile pattern, or a note scribbled in the moment.",
    "I wanted one calm workspace where those fragments could become a useful bathroom design plan without losing context.",
    "Bathideas turns rough inspiration into something organized, searchable, and ready to refine later.",
];

const workflowPoints = [
    "Capture bathroom ideas quickly from notes, screenshots, photos, and voice memos.",
    "Organize the rough inspiration into one focused dashboard.",
    "Refine the details until the concept becomes a useful plan.",
];

export default function Home() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background">
            <AppSmoothScroll />
            <LandingGridBackground />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--accent)_30%,white)_0%,transparent_72%)]" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-400 flex-col px-4 py-4 md:px-6 md:py-6">
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
                    <LandingStagger className="contents" delay={0.1} stagger={0.09}>
                        <LandingReveal inherit delay={0} y={16} blur={10} duration={0.55}>
                            <Badge
                                variant="outline"
                                className="mb-6 px-4 py-1 font-mono"
                            >
                                Bathroom idea capture and organization
                            </Badge>
                        </LandingReveal>

                        <LandingReveal inherit delay={0.2} y={20} blur={12} duration={0.7}>
                            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-normal text-balance text-foreground md:mt-6 md:text-6xl">
                                Turn bathroom inspiration from anywhere into{" "}
                                <span className="text-primary">
                                    useful design plans
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
                            delay={0.4}
                            y={18}
                            blur={10}
                            duration={0.58}
                            className="w-full"
                        >
                            <section
                                id="workflow"
                                className="mt-12 scroll-mt-28 grid w-full gap-6 border border-border bg-card p-5 text-left shadow-2xl backdrop-blur md:scroll-mt-32 md:p-6 lg:grid-cols-[1.1fr_0.9fr]"
                            >
                                <div className="space-y-4">
                                    <Badge
                                        variant="outline"
                                        className="px-3 py-1 font-mono"
                                    >
                                        Product snapshot
                                    </Badge>
                                    <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                                        Capture messy bathroom inspiration and
                                        turn it into something you can actually
                                        use.
                                    </h2>
                                    <p className="max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
                                        The app side stays focused on the
                                        workflow: save ideas from anywhere,
                                        shape them in a dashboard, review the
                                        details, and organize the strongest
                                        concepts in one place.
                                    </p>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button asChild>
                                            <Link href="/dashboard">
                                                Open dashboard
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href="/login">Sign in</Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    {workflowPoints.map((point, index) => (
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
                                        Good bathroom ideas deserve more than
                                        a messy notes app.
                                    </h2>
                                    <p className="max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
                                        This project exists to make bathroom
                                        inspiration easy to capture, then give
                                        it structure. It keeps early fragments,
                                        richer detail, and final planning in one
                                        place so the ideas become usable instead
                                        of lost.
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
                                            Open the product, sign in, and keep
                                            organizing bathroom ideas in one
                                            place.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Button asChild>
                                            <Link href="/dashboard">
                                                Go to dashboard
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href="/login">Sign in</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </LandingReveal>
                    </LandingStagger>
                </section>
            </div>
            <LandingFooter />
        </main>
    );
}
 
