"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ListingSearchOptionsPanel } from "@/features/listing/components/listing-search-options-panel";

export function ListingMobileSearchButton({
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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="xl:hidden"
          aria-label="Search listings"
        >
          <Search className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="gap-3 p-4 xl:hidden">
        <SheetHeader className="p-0 pr-10">
          <SheetTitle>Search listings</SheetTitle>
        </SheetHeader>
        <ListingSearchOptionsPanel
          query={query}
          page={page}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </SheetContent>
    </Sheet>
  );
}
