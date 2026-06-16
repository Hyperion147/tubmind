"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Clock3,
  FilePenLine,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  PanelLeft,
  ShieldCheck,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  user: {
    displayName: string;
    avatarUrl: string | null;
    isAdmin?: boolean;
  };
};

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    matchers: ["/dashboard"],
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    icon: FolderKanban,
    matchers: ["/dashboard/projects", "/tub"],
  },
  {
    href: "/dashboard/ideas",
    label: "Ideas",
    icon: FilePenLine,
    matchers: ["/dashboard/ideas", "/dashboard/idea"],
  },
  {
    href: "/dashboard/tasks",
    label: "Tasks",
    icon: ListTodo,
    matchers: ["/dashboard/tasks"],
  },
  {
    href: "/dashboard/time",
    label: "Time",
    icon: Clock3,
    matchers: ["/dashboard/time"],
  },
  {
    href: "/admin",
    label: "Admin",
    icon: ShieldCheck,
    matchers: ["/admin"],
    adminOnly: true,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileExpandedClasses = mobileOpen ? "w-72" : "w-20";
  const isAdminRoute = pathname.startsWith("/admin");

  function getIsActive(matchers: string[], href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    if (href === "/admin") {
      return isAdminRoute;
    }

    return matchers.some((matcher) => pathname.startsWith(matcher));
  }

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center border border-border bg-secondary">
              <Image
                src="/logo.png"
                alt="Tubmind logo"
                width={28}
                height={28}
                className="size-7 object-cover"
                priority
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                tubmind
              </p>
              <p className="text-sm font-semibold text-foreground">Workspace</p>
            </div>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle dashboard navigation"
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>
      </div>

      <aside
        className={cn(
          "group border-r border-border bg-card/92 shadow-[14px_0_40px_-24px_color-mix(in_oklch,var(--foreground)_20%,transparent)] backdrop-blur-xl transition-[width,transform] duration-200 ease-out md:fixed md:left-0 md:top-0 md:z-50 md:h-screen md:w-20 md:overflow-hidden md:hover:w-72",
          mobileOpen
            ? `fixed inset-y-0 left-0 z-50 block ${mobileExpandedClasses}`
            : "hidden md:block",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-4 py-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center border border-border bg-secondary shadow-[3px_3px_0px_0px_var(--color-border)]">
                <Image
                  src="/logo.png"
                  alt="Tubmind logo"
                  width={36}
                  height={36}
                  className="size-9 object-cover"
                  priority
                />
              </div>
              <div
                className="min-w-0 overflow-hidden"
              >
                <p
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap transition-all duration-200 ease-out",
                    mobileOpen
                      ? "max-w-[152px] opacity-100"
                      : "max-w-0 -translate-x-2 opacity-0 md:group-hover:max-w-[152px] md:group-hover:translate-x-0 md:group-hover:opacity-100",
                  )}
                >
                  tubmind
                </p>
                <p
                  className={cn(
                    "truncate text-base font-semibold text-foreground whitespace-nowrap transition-all duration-200 ease-out",
                    mobileOpen
                      ? "max-w-[152px] opacity-100"
                      : "max-w-0 -translate-x-2 opacity-0 md:group-hover:max-w-[152px] md:group-hover:translate-x-0 md:group-hover:opacity-100",
                  )}
                >
                  Creative OS
                </p>
              </div>
            </Link>
          </div>

          <div className="flex-1 px-3 py-4">
            <div className="grid gap-2">
              <nav className="grid gap-2">
                {navItems.filter((item) => !item.adminOnly || user.isAdmin).map((item) => {
                  const isActive = getIsActive(item.matchers, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={!mobileOpen ? item.label : undefined}
                      className={cn(
                        "relative flex h-11 items-center gap-3 border border-border bg-background/60 px-3 py-3 text-sm text-muted-foreground transition-[border-color,background-color,color,box-shadow] hover:border-primary/35 hover:bg-secondary/70 hover:text-foreground",
                        isActive &&
                          "border-primary/45 bg-secondary text-foreground shadow-[3px_3px_0px_0px_var(--color-border)]",
                      )}
                    >
                      <div className="flex size-4 shrink-0 items-center justify-center md:translate-x-[6px] md:transition-transform md:duration-200 md:ease-out md:group-hover:translate-x-0">
                        <Icon className="size-4 shrink-0" />
                      </div>
                      <span
                        className={cn(
                          "overflow-hidden whitespace-nowrap transition-all duration-200 ease-out",
                          mobileOpen
                            ? "max-w-[120px] opacity-100"
                            : "max-w-0 -translate-x-1.5 opacity-0 md:group-hover:max-w-[120px] md:group-hover:translate-x-0 md:group-hover:opacity-100",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-border px-4 py-4">
            <div className="flex h-[72px] items-center gap-3 border border-border bg-background/70 p-3 shadow-[3px_3px_0px_0px_var(--color-border)]">
              <div className="md:-translate-x-1 md:transition-transform md:duration-200 md:ease-out md:group-hover:translate-x-0">
                <Avatar size="default">
                  {user.avatarUrl ? (
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={`${user.displayName} avatar`}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </div>
              <div
                className={cn(
                  "min-w-0 overflow-hidden transition-all duration-200 ease-out",
                  mobileOpen
                    ? "max-w-[152px] opacity-100"
                    : "max-w-0 -translate-x-2 opacity-0 md:group-hover:max-w-[152px] md:group-hover:translate-x-0 md:group-hover:opacity-100",
                )}
              >
                <p className="truncate text-sm font-semibold text-foreground whitespace-nowrap">
                  {user.displayName}
                </p>
                <Link
                  href="/auth/logout"
                  className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="size-3" />
                  Log out
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
