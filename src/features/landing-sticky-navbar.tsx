"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardIcon } from "@/components/ui/dashboard-icon";
import Image from "next/image";

export function LandingStickyNavbar() {
    return (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 md:px-6">
            <div className="mx-auto w-full max-w-6xl flex items-center justify-between rounded-lg bg-background/80 px-3 py-2 backdrop-blur-sm border border-border">
                <Link
                    href="/"
                    className="flex gap-2 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                    <div className="size-9 overflow-hidden border border-border bg-accent/40 text-accent-foreground">
                        <Image
                            src="/logo.png"
                            alt="TUBMIND Logo"
                            width={36}
                            height={36}
                        />
                    </div>
                    <span className="text-base font-semibold text-foreground md:text-lg">
                        TUBMIND
                    </span>
                </Link>

                <div className="pointer-events-auto">
                    <Button asChild>
                        <a
                            href="https://app.tubmind.space"
                            className="gap-2 md:px-3"
                        >
                            <span>Dashboard</span>
                            <DashboardIcon
                                size={64}
                                duration={1}
                                color="#ffffff"
                            />
                        </a>
                    </Button>
               </div>
            </div>
        </div>
    );
}
