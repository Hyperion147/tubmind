"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type SiteBreadcrumbItem = {
  label: string;
  href?: string;
};

type SiteBreadcrumbProps = {
  items: SiteBreadcrumbItem[];
  className?: string;
};

export function SiteBreadcrumb({ items, className }: SiteBreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "border border-border bg-card/72 px-3 py-2 text-sm text-muted-foreground backdrop-blur",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="size-3.5 shrink-0" /> : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-foreground" : ""}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
