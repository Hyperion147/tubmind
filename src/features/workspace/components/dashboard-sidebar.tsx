"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
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
  const [isHovered, setIsHovered] = useState(false);
  const expanded = mobileOpen || isHovered;

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

      <motion.aside
        initial={false}
        animate={{
          width: expanded ? 288 : 80,
          x: mobileOpen ? 0 : undefined,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 28,
          mass: 0.9,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "border-r border-border bg-card/92 shadow-[14px_0_40px_-24px_color-mix(in_oklch,var(--foreground)_20%,transparent)] backdrop-blur-xl md:fixed md:left-0 md:top-0 md:z-50 md:h-screen md:overflow-hidden",
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 block"
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
              <motion.div
                initial={false}
                animate={{
                  width: expanded ? 152 : 0,
                  opacity: expanded ? 1 : 0,
                  x: expanded ? 0 : -8,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="min-w-0 overflow-hidden"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                  tubmind
                </p>
                <p className="truncate text-base font-semibold text-foreground whitespace-nowrap">
                  Creative OS
                </p>
              </motion.div>
            </Link>
          </div>

          <div className="flex-1 px-3 py-4">
            <div className="grid gap-2">
              <nav className="grid gap-2">
                {navItems.filter((item) => !item.adminOnly || user.isAdmin).map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : item.matchers.some((matcher) => pathname.startsWith(matcher));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={!expanded ? item.label : undefined}
                      className={cn(
                        "relative flex h-11 items-center gap-3 border border-border bg-background/60 px-3 py-3 text-sm text-muted-foreground transition-[border-color,background-color,color,box-shadow] hover:border-primary/35 hover:bg-secondary/70 hover:text-foreground",
                        isActive &&
                          "border-primary/45 bg-secondary text-foreground shadow-[3px_3px_0px_0px_var(--color-border)]",
                      )}
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          x: expanded ? 0 : 6,
                        }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="flex size-4 shrink-0 items-center justify-center"
                      >
                        <Icon className="size-4 shrink-0" />
                      </motion.div>
                      <motion.span
                        initial={false}
                        animate={{
                          width: expanded ? 120 : 0,
                          opacity: expanded ? 1 : 0,
                          x: expanded ? 0 : -6,
                        }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-border px-4 py-4">
            <div className="flex h-[72px] items-center gap-3 border border-border bg-background/70 p-3 shadow-[3px_3px_0px_0px_var(--color-border)]">
              <motion.div
                initial={false}
                animate={{
                  x: expanded ? 0 : -4,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
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
              </motion.div>
              <motion.div
                initial={false}
                animate={{
                  width: expanded ? 152 : 0,
                  opacity: expanded ? 1 : 0,
                  x: expanded ? 0 : -8,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="min-w-0 overflow-hidden"
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
              </motion.div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
