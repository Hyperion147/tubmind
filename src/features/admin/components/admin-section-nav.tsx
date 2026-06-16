"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const adminLinks = [
  {
    href: "/admin",
    label: "Overview",
    eyebrow: "Hub",
    description: "Start here, then move into the exact moderation queue you need.",
  },
  {
    href: "/admin/ideas",
    label: "Ideas",
    eyebrow: "Listings",
    description: "Review visibility, revisions, and removal decisions for idea pages.",
  },
  {
    href: "/admin/users",
    label: "Users",
    eyebrow: "Accounts",
    description: "Moderate roles, review states, and account access.",
  },
  {
    href: "/admin/comments",
    label: "Comments",
    eyebrow: "Discussion",
    description: "Clean up public feedback without leaving the admin area.",
  },
];

export function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-3 lg:grid-cols-4">
      {adminLinks.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group border border-border bg-card/70 p-3 transition-[border-color,background-color,transform] duration-300 ease-out hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              isActive && "border-primary/45 bg-secondary/70"
            )}
          >
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
              {item.eyebrow}
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span
                className={cn(
                  "mt-1 h-2 w-2 shrink-0 bg-border transition-colors duration-300",
                  isActive && "bg-primary"
                )}
              />
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
