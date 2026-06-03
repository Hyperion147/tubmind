"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Workflow", href: "#workflow" },
  { label: "Why", href: "#why" },
  { label: "App", href: "/dashboard" },
] as const;

export function LandingStickyNavbar() {
  const [isCompact, setIsCompact] = useState(false);
  const pathname = usePathname();
  const routeActiveHref = getRouteActiveHref(pathname) ?? "/";
  const [scrollActiveHref, setScrollActiveHref] = useState(routeActiveHref);
  const activeHref = pathname === "/" ? scrollActiveHref : routeActiveHref;

  useEffect(() => {
    const onScroll = () => {
      setIsCompact(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const targets = navItems
      .map((item) => {
        if (item.href === "/") {
          return { href: item.href, id: "home" };
        }

        if (item.href.startsWith("#")) {
          return { href: item.href, id: item.href.slice(1) };
        }

        return null;
      })
      .filter((target): target is { href: string; id: string } => target !== null);

    const updateActiveHref = () => {
      const activeLine = Math.min(window.innerHeight * 0.32, 180);
      let nextActiveHref = routeActiveHref;

      for (const target of targets) {
        const element = document.getElementById(target.id);

        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top <= activeLine) {
          nextActiveHref = target.href;
        }
      }

      setScrollActiveHref(nextActiveHref);
    };

    updateActiveHref();
    window.addEventListener("scroll", updateActiveHref, { passive: true });
    window.addEventListener("resize", updateActiveHref);

    return () => {
      window.removeEventListener("scroll", updateActiveHref);
      window.removeEventListener("resize", updateActiveHref);
    };
  }, [pathname, routeActiveHref]);

  return (
    <>
      <div className="h-19 md:h-21" />
      <div className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 md:px-6">
        <div className="mx-auto w-full max-w-400">
          <header
            className={cn(
              "pointer-events-auto mx-auto grid w-full items-center gap-4 border border-border bg-card/92 px-4 py-3 shadow-sm backdrop-blur transition-[max-width] duration-500 ease-out md:grid-cols-[auto_1fr_auto] md:px-5",
              isCompact ? "max-w-6xl" : "max-w-full"
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

            <nav className="hidden items-center justify-center gap-2 md:flex">
              {navItems.map((item) => {
                const isActive =
                  activeHref === item.href ||
                  (item.href !== "/" && activeHref.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-secondary/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isActive && "bg-secondary/75 text-foreground shadow-sm"
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-px bg-primary transition-all duration-300",
                        isActive ? "w-[calc(100%-1.5rem)]" : "w-0 group-hover:w-[calc(100%-1.5rem)]"
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="justify-self-end">
              <Button asChild className="min-w-0">
                <Link href="/dashboard" className="gap-2 md:px-3">
                  <span>Open app</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </header>
        </div>
      </div>
    </>
  );
}

function getRouteActiveHref(pathname: string) {
  return navItems.find((item) => pathname === item.href)?.href;
}
