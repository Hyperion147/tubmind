"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchParamValue = string | null | undefined;

export function useUrlSearchState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setSearchParams = useCallback(
    (updates: Record<string, SearchParamValue>, scroll = false) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          nextParams.delete(key);
          continue;
        }

        nextParams.set(key, value);
      }

      const query = nextParams.toString();
      const href = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(href, { scroll });
      });
    },
    [pathname, router, searchParams],
  );

  return {
    isPending,
    searchParams,
    setSearchParams,
  };
}
