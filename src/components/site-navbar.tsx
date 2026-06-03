import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SiteNavbarAction = {
    label: string;
    href: string;
    icon?: LucideIcon;
    variant?: "default" | "outline" | "ghost";
    hideOnMobile?: boolean;
};

export type SiteNavbarItem = {
    label: string;
    href: string;
    matchPrefix?: boolean;
};

export type SiteNavbarProps = {
    brandHref?: string;
    eyebrow?: string;
    title: string;
    icon: LucideIcon;
    iconClassName?: string;
    navItems?: SiteNavbarItem[];
    activeHref?: string;
    userLabel?: string;
    actions?: SiteNavbarAction[];
    constrained?: boolean;
};

export function SiteNavbar({
    brandHref = "/",
    eyebrow = "Bathideas",
    title,
    iconClassName,
    navItems = [],
    activeHref,
    userLabel,
    actions = [],
    constrained = false,
}: SiteNavbarProps) {
    return (
        <header
            className={cn(
                "flex w-full items-center justify-between border border-border bg-card/90 px-4 py-3 shadow-sm backdrop-blur transition-colors duration-300 hover:border-primary/35 hover:bg-card md:px-5",
                constrained && "mx-auto max-w-6xl px-5 py-4",
            )}
        >
            <Link
                href={brandHref}
                className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                <div
                    className={cn(
                        "flex size-9 items-center justify-center overflow-hidden border border-border bg-accent/45 text-accent-foreground",
                        iconClassName,
                    )}
                >
                    <Image
                        src="/logo.png"
                        alt="Bathideas logo"
                        width={36}
                        height={36}
                        className="size-full object-cover"
                        priority
                    />
                </div>
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {eyebrow}
                    </p>
                    <p className="text-base font-semibold text-foreground md:text-lg">
                        {title}
                    </p>
                </div>
            </Link>

            {navItems.length > 0 ? (
                <nav className="hidden items-center gap-5 lg:flex">
                    {navItems.map((item) => {
                        const isActive =
                            activeHref === item.href ||
                            (item.matchPrefix &&
                                activeHref?.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group relative text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                                    isActive && "text-foreground",
                                )}
                            >
                                {item.label}
                                <span
                                    className={cn(
                                        "absolute -bottom-2 left-0 h-px bg-primary transition-all duration-300 group-hover:w-full",
                                        isActive ? "w-full" : "w-0",
                                    )}
                                />
                            </Link>
                        );
                    })}
                </nav>
            ) : null}

            <div className="flex items-center gap-2">
                {userLabel ? (
                    <Badge
                        variant="outline"
                        className="hidden px-2.5 py-4 font-mono md:inline-flex"
                    >
                        {userLabel}
                    </Badge>
                ) : null}
                {actions.map((action) => {
                    const ActionIcon = action.icon;

                    return (
                        <Button
                            key={`${action.href}-${action.label}`}
                            asChild
                            variant={action.variant ?? "default"}
                            className={cn(
                                action.hideOnMobile && "hidden md:inline-flex",
                            )}
                        >
                            <Link
                                href={action.href}
                                aria-label={action.label}
                                className={cn(
                                    "gap-2",
                                    ActionIcon && "md:px-3",
                                )}
                            >
                                {ActionIcon ? (
                                    <>
                                        <ActionIcon className="size-4 md:hidden" />
                                        <span className="hidden md:inline">
                                            {action.label}
                                        </span>
                                        <ActionIcon className="hidden size-4 md:inline" />
                                    </>
                                ) : (
                                    action.label
                                )}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </header>
    );
}
