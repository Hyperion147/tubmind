import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListingCardLikeButton } from "@/features/listing/card/listing-card-like-button";

export type ListingCardData = {
  id: string;
  initialReacted: boolean;
  ownerName: string;
  publishedAt: Date | null;
  reactionCount: number;
  slug: string;
  summary: string | null;
  title: string;
};

function formatPublishedAt(date: Date | null) {
  if (!date) {
    return "Recently published";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return "Recently published";
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 1 && diffDays <= 6) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  if (diffDays === 0 && diffHours >= 1) {
    const remainingMinutes = diffMinutes % 60;

    return `Today, ${diffHours}h ${remainingMinutes}m ago`;
  }

  if (diffDays === 0) {
    return `Today, ${Math.max(diffMinutes, 1)}m ago`;
  }

  return date.toLocaleDateString();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ListingCard({
  idea,
  isAuthenticated,
  nextPath,
}: {
  idea: ListingCardData;
  isAuthenticated: boolean;
  nextPath: string;
}) {
  return (
    <Card className="group relative snap-start overflow-hidden border-border bg-card/92 shadow-md backdrop-blur transition-colors duration-300 hover:border-primary/40 hover:bg-card">
      <CardHeader className="gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>{getInitials(idea.ownerName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {idea.ownerName}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {formatPublishedAt(idea.publishedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <CardTitle className="max-w-[90%] text-2xl tracking-tight transition group-hover:text-primary">
            {idea.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-sm leading-7">
            {idea.summary}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <ListingCardLikeButton
          ideaId={idea.id}
          initialCount={idea.reactionCount}
          initialReacted={idea.initialReacted}
          isAuthenticated={isAuthenticated}
          nextPath={nextPath}
        />
      </CardContent>

      <CardFooter className="justify-end border-t border-border/70 pt-5">
        <Button asChild variant="outline" size="sm">
          <Link href={`/listings/${idea.slug}`} className="gap-2">
            Open listing
            <ArrowRight className="size-4 transition-colors" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
