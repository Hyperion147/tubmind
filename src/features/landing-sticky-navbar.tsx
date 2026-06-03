"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardIcon } from "@/components/ui/dashboard-icon";

export function LandingStickyNavbar() {
    return (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 md:px-6">
            <div className="mx-auto w-full max-w-400">
                <header
                    className={cn(
                        "pointer-events-auto mx-auto grid w-full items-center gap-4 border border-border bg-card/92 px-4 py-3 shadow-sm backdrop-blur transition-[max-width] duration-500 ease-out md:grid-cols-[auto_1fr_auto] md:px-5 max-w-6xl",
                    )}
                >
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 justify-self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        <div className="flex size-9 items-center justify-center overflow-hidden border border-border bg-accent/40 text-accent-foreground">
                            <Sparkles className="size-4.5" aria-hidden="true" />
                        </div>
                        <span className="text-base font-semibold text-foreground md:text-lg">
                            BATHIDEAS
                        </span>
                    </Link>

                    <div className="justify-self-end">
                        <Button asChild className="min-w-0">
                            <Link href="https://app.tubmind.com" className="gap-2 md:px-3">
                                <span>Try Beta Dashboard</span>
                                <DashboardIcon
                                    size={64}
                                    duration={1}
                                    color="#ffffff"
                                />
                            </Link>
                        </Button>
                    </div>
                </header>
            </div>
        </div>
    );
}
