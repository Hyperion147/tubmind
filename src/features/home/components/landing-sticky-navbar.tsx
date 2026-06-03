"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";

import {
  SiteNavbar,
  type SiteNavbarAction,
  type SiteNavbarItem,
  type SiteNavbarProps,
} from "@/components/site-navbar";
import { cn } from "@/lib/utils";

type LandingStickyNavbarProps = Omit<SiteNavbarProps, "icon" | "actions"> & {
  actions?: Array<
    Omit<SiteNavbarAction, "icon"> & {
      iconName?: "arrow-right";
    }
  >;
  iconName?: "sparkles";
};

const iconMap: Record<NonNullable<LandingStickyNavbarProps["iconName"]>, LucideIcon> = {
  sparkles: Sparkles,
};
const actionIconMap: Record<"arrow-right", LucideIcon> = {
  "arrow-right": ArrowRight,
};

export function LandingStickyNavbar({
  iconName = "sparkles",
  actions = [],
  navItems = [],
  ...props
}: LandingStickyNavbarProps) {
  const [isCompact, setIsCompact] = useState(false);
  const pathname = usePathname();
  const routeActiveHref = getRouteActiveHref(pathname, navItems) ?? "/";
  const [scrollActiveHref, setScrollActiveHref] = useState(routeActiveHref);
  const Icon = iconMap[iconName];
  const resolvedActions: SiteNavbarAction[] = actions.map((action) => ({
    ...action,
    icon: action.iconName ? actionIconMap[action.iconName] : undefined,
  }));
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

        const rect = element.getBoundingClientRect();

        if (rect.top <= activeLine) {
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
  }, [navItems, pathname, routeActiveHref]);

  return (
    <>
      <div className="h-19 md:h-21" />
      <div className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 md:px-6">
        <div className="mx-auto w-full max-w-400">
          <div
            className={cn(
              "pointer-events-auto mx-auto w-full transition-[max-width] duration-500 ease-out",
              isCompact ? "max-w-6xl" : "max-w-full"
            )}
          >
            <SiteNavbar
              {...props}
              icon={Icon}
              actions={resolvedActions}
              eyebrow={""}
              title={"BATHIDEAS"}
              activeHref={activeHref}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function getRouteActiveHref(pathname: string, navItems: SiteNavbarItem[]) {
  return navItems.find((item) => {
    if (item.href === pathname) {
      return true;
    }

    return item.matchPrefix && pathname.startsWith(item.href);
  })?.href;
}
