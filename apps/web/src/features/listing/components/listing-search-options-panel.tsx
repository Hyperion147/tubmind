"use client";

import Link from "next/link";
import { useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ListingSearchOptionsPanel({
  page,
  query,
  totalCount,
  totalPages,
}: {
  page: number;
  query: string;
  totalCount: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const timeoutRef = useRef<number | null>(null);

  function handleSearchChange(value: string) {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      if (value === query) {
        return;
      }

      const nextParams = new URLSearchParams();
      const trimmedValue = value.trim();

      if (trimmedValue) {
        nextParams.set("q", trimmedValue);
      }

      const nextUrl = nextParams.toString()
        ? `${pathname}?${nextParams.toString()}`
        : pathname;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    }, 300);
  }

  function buildHref(nextPage: number) {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }
    if (nextPage > 1) {
      nextParams.set("page", String(nextPage));
    }

    const search = nextParams.toString();
    return search ? `${pathname}?${search}` : pathname;
  }

  return (
    <Card className="border-border bg-card/90 shadow-xl backdrop-blur transition-colors duration-300 hover:border-primary/35 hover:bg-card">
      <CardContent className="grid gap-4 px-6 pt-0">
        <Badge variant="outline" className="w-fit px-3 py-1 font-mono">
          Search options
        </Badge>
        <div className="grid gap-2">
          <div className="flex flex-col gap-3 border border-border bg-background/70 p-3 transition-colors duration-300 focus-within:border-primary focus-within:bg-background">
            <div className="relative flex-1">
              <Input
                id="q"
                name="q"
                defaultValue={query}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search listings"
                className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="border border-border bg-secondary/70 px-3 py-2 text-secondary-foreground">
            {totalCount} published
          </span>
        </div>

        {page > 1 || page < totalPages ? (
          <div className="flex items-center gap-2 pt-1">
            <Button asChild variant="outline" className="flex-1">
              <Link
                href={page > 1 ? buildHref(page - 1) : "#"}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-40" : ""}
              >
                Previous
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link
                href={page < totalPages ? buildHref(page + 1) : "#"}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
              >
                Next
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
