import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { humanize } from "@/features/workspace/lib/formatters";

export function StatCard({
    label,
    value,
    detail,
    icon: Icon,
    href,
}: {
    label: string;
    value: number;
    detail: string;
    icon: LucideIcon;
    href?: string;
}) {
    const content = (
        <div className="border border-border bg-background/82 p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-4xl font-semibold tracking-tight text-foreground">
                        {value}
                    </p>
                </div>
                <div className="flex size-9 items-center justify-center bg-secondary text-primary">
                    <Icon className="size-4" />
                </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
        </div>
    );

    if (!href) {
        return content;
    }

    return (
        <Link
            href={href}
            className="group block transition-colors hover:border-primary/35 [&>div]:transition-colors [&>div]:group-hover:border-primary/35 [&>div]:group-hover:bg-secondary/30"
        >
            {content}
        </Link>
    );
}

export function PanelCard({
    title,
    footerHref,
    footerLabel,
    children,
}: {
    title: string;
    footerHref?: string;
    footerLabel?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="border border-border/80 bg-card/86 shadow-sm">
            <CardHeader className="border-b border-border/70">
                <CardTitle className="text-xl font-semibold text-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">{children}</div>
                {footerHref && footerLabel ? (
                    <div className="mt-5 border-t border-border/70 pt-4 text-right">
                        <Link
                            href={footerHref}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {footerLabel}
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

export function EmptyPanel({ copy }: { copy: string }) {
    return (
        <div className="border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
            {copy}
        </div>
    );
}

export function InlineMeta({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground">
            {children}
        </span>
    );
}

export function StatusPill({
    label,
    overdue = false,
}: {
    label: string;
    overdue?: boolean;
}) {
    const colorClass = overdue
        ? "bg-destructive/10 text-destructive"
        : label === "shared"
          ? "bg-secondary text-secondary-foreground"
          : label === "ongoing"
            ? "bg-[color-mix(in_oklch,var(--primary)_16%,white)] text-primary"
            : "bg-background text-muted-foreground";

    return (
        <span
            className={`inline-flex items-center px-2 py-1 text-[11px] font-medium capitalize ${colorClass}`}
        >
            {overdue ? "Overdue" : humanize(label)}
        </span>
    );
}

export function QuickAction({
    href,
    icon: Icon,
    title,
}: {
    href: string;
    icon: LucideIcon;
    title: string;
}) {
    return (
        <Link
            href={href}
            className="flex gap-2 items-center border border-border bg-background/72 p-3 transition-colors hover:border-primary/35 hover:bg-secondary/40 w-full"
        >
            <div className="flex size-8 items-center justify-center bg-secondary text-primary">
                <Icon className="size-4" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
            </div>
            <ArrowRight className="size-4 justify-self-end" />
        </Link>
    );
}
