import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { AppSmoothScroll } from "@/components/smooth-scroll";
import { LandingAppAccessCta } from "@/features/landing/landing-app-access-cta";
import { LandingBeforeAfterStrip } from "@/features/landing/landing-before-after-strip";
import { LandingDashboardCta } from "@/features/landing/landing-dashboard-cta";
import { LandingFeaturePanels } from "@/features/landing/landing-feature-panels";
import LandingFooter from "@/features/landing/landing-footer";
import { LandingReveal } from "@/features/landing/landing-reveal";
import { LandingStagger } from "@/features/landing/landing-stagger";
import { LandingStickyNavbar } from "@/features/landing/landing-sticky-navbar";
import { LandingStrip } from "@/features/landing/landing-strip";
import { LandingWorkflowLine } from "@/features/landing/landing-workflow-line";
import { getSiteUrl, seoConfig } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Private idea workspace",
    description: seoConfig.description,
    alternates: {
        canonical: seoConfig.canonicalPath,
    },
    openGraph: {
        type: "website",
        siteName: seoConfig.siteName,
        title: `${seoConfig.siteName} | Private idea workspace`,
        description: seoConfig.description,
        url: seoConfig.canonicalPath,
        images: [
            {
                url: seoConfig.ogImage,
                alt: seoConfig.ogImageAlt,
                width: 1901,
                height: 956,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `${seoConfig.siteName} | Private idea workspace`,
        description: seoConfig.description,
        images: [seoConfig.ogImage],
    },
};

export default function Home() {
    const siteUrl = getSiteUrl().toString().replace(/\/$/, "");
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: seoConfig.siteName,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: seoConfig.description,
        url: siteUrl,
        image: `${siteUrl}${seoConfig.ogImage}`,
    };

    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />
            <AppSmoothScroll />

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
                            delay={0.2}
                            y={20}
                            blur={12}
                            duration={0.7}
                        >
                            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-normal text-balance text-[#111111] md:mt-6 md:text-[54px]">
                                <span className="block md:text-6xl">
                                    Good ideas die in notes apps.
                                </span>
                                <span className="block text-primary">
                                    Tubmind keeps them private, gives them
                                    structure and publishes the strongest ones.
                                </span>
                            </h1>
                            {/* <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-normal text-balance md:mt-6 md:text-[54px] text-[#111111]">
                                <p className="text-[#111111] text-6xl">
                                    Good ideas die in notes apps.
                                </p>
                                <p>
                                    <span className="text-primary">
                                        Tubmind
                                    </span>{" "}
                                    keeps them private, gives them structure and
                                    publishes the strongest ones.
                                </p>
                            </h1> */}
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
                            <LandingDashboardCta />
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.46}
                            y={18}
                            blur={10}
                            duration={0.62}
                            className="w-full"
                        >
                            <LandingStrip />
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
                                className="mt-24 scroll-mt-28 w-full gap-4 border border-border bg-card/84 p-5 text-left shadow-sm backdrop-blur md:scroll-mt-32 md:p-6 flex items-end flex-col md:flex-row"
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
                                </div>
                                <div>
                                    <p className="max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
                                        This project exists to make idea capture
                                        feel instant, then give it structure. It
                                        keeps early fragments, richer notes,
                                        management tub, boards and final
                                        planning in one place so the ideas
                                        become usable instead of lost.
                                    </p>
                                </div>
                            </section>
                        </LandingReveal>

                        <LandingReveal
                            inherit
                            delay={0.52}
                            y={18}
                            blur={10}
                            duration={0.62}
                            className="w-full mt-4"
                        >
                            <LandingBeforeAfterStrip />
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
                            delay={0.56}
                            y={14}
                            blur={8}
                            duration={0.5}
                            className="w-full"
                        >
                            <LandingAppAccessCta />
                        </LandingReveal>
                    </LandingStagger>
                </section>
            </div>
            <div className="relative z-10 mt-12 w-full">
                <LandingFooter />
            </div>
        </main>
    );
}
