import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ListingEmptyState() {
  return (
    <Card className="border-dashed bg-card/85 shadow-sm backdrop-blur">
      <CardContent className="py-16">
        <div className="mx-auto grid max-w-2xl gap-5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center border border-border bg-accent/45 text-accent-foreground">
            <Search className="size-5" />
          </div>
          <Badge variant="outline" className="mx-auto px-3 py-1 font-mono">
            Nothing here yet
          </Badge>
          <h2 className="text-3xl font-semibold text-foreground">
            No published ideas found
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Try a different search, or publish the first idea from your
            dashboard.
          </p>
          <div className="mx-auto flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/listings">Clear search</Link>
            </Button>
            <Button asChild>
              <Link href="/">Open dashboard</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
