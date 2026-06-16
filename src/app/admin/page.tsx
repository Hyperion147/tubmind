import Link from "next/link";
import { Suspense } from "react";
import { count, eq } from "drizzle-orm";
import {
  AlertCircle,
  ArrowRight,
  ListChecks,
  UserRoundCog,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { ideaComments, ideas, profiles } from "@/db/schema";

export default function AdminHomePage() {
  return (
    <div className="grid gap-4">
      <Card className="border-border bg-card/90 shadow-xl backdrop-blur">
        <CardHeader className="gap-3 p-5 md:p-6">
          <Badge variant="outline" className="w-fit px-2.5 py-0.5 font-mono">
            Admin Workspace
          </Badge>
          <div className="max-w-4xl space-y-2">
            <CardTitle className="font-semibold leading-[0.98] tracking-tight text-foreground md:text-4xl">
              One moderation home, then focused panels underneath it.
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-7 md:text-base">
              Start from the hub, choose the queue you need, and let heavier admin data stream in only on the page that needs it.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        <Suspense fallback={<OverviewCardSkeleton />}>
          <IdeasOverviewCard />
        </Suspense>
        <Suspense fallback={<OverviewCardSkeleton />}>
          <UsersOverviewCard />
        </Suspense>
        <Suspense fallback={<OverviewCardSkeleton />}>
          <CommentsOverviewCard />
        </Suspense>
      </section>
    </div>
  );
}

async function IdeasOverviewCard() {
  const [totalIdeasResult, publicIdeasResult, revisionIdeasResult] = await Promise.all([
    db.select({ value: count() }).from(ideas),
    db.select({ value: count() }).from(ideas).where(eq(ideas.visibility, "public")),
    db.select({ value: count() }).from(ideas).where(eq(ideas.status, "needs_revision")),
  ]);

  return (
    <OverviewCard
      title="Ideas"
      href="/admin/ideas"
      icon={<ListChecks className="size-4" />}
      stats={[
        `${totalIdeasResult[0]?.value ?? 0} total`,
        `${publicIdeasResult[0]?.value ?? 0} public`,
        `${revisionIdeasResult[0]?.value ?? 0} revision`,
      ]}
      description="The listings queue stays separate, so visibility and publishing decisions do not slow down account moderation."
    />
  );
}

async function UsersOverviewCard() {
  const [totalUsersResult, blockedUsersResult, reviewUsersResult] = await Promise.all([
    db.select({ value: count() }).from(profiles),
    db.select({ value: count() }).from(profiles).where(eq(profiles.status, "blocked")),
    db.select({ value: count() }).from(profiles).where(eq(profiles.status, "under_review")),
  ]);

  return (
    <OverviewCard
      title="Users"
      href="/admin/users"
      icon={<UserRoundCog className="size-4" />}
      stats={[
        `${totalUsersResult[0]?.value ?? 0} total`,
        `${blockedUsersResult[0]?.value ?? 0} blocked`,
        `${reviewUsersResult[0]?.value ?? 0} review`,
      ]}
      description="Account actions now live on their own page, which keeps role and status checks lighter and easier to scan."
    />
  );
}

async function CommentsOverviewCard() {
  const [totalCommentsResult, hiddenCommentsResult, deletedCommentsResult] = await Promise.all([
    db.select({ value: count() }).from(ideaComments),
    db.select({ value: count() }).from(ideaComments).where(eq(ideaComments.status, "hidden")),
    db.select({ value: count() }).from(ideaComments).where(eq(ideaComments.status, "deleted")),
  ]);

  return (
    <OverviewCard
      title="Comments"
      href="/admin/comments"
      icon={<AlertCircle className="size-4" />}
      stats={[
        `${totalCommentsResult[0]?.value ?? 0} total`,
        `${hiddenCommentsResult[0]?.value ?? 0} hidden`,
        `${deletedCommentsResult[0]?.value ?? 0} deleted`,
      ]}
      description="Discussion moderation gets its own pass now, so comment cleanup can stay quick without dragging user rows along."
    />
  );
}

function OverviewCard({
  title,
  href,
  icon,
  stats,
  description,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  stats: string[];
  description: string;
}) {
  return (
    <Card className="border-border bg-card/92 shadow-md backdrop-blur">
      <CardHeader className="gap-4 p-5 md:p-6">
        <div className="flex size-11 items-center justify-center border border-border bg-background/75 text-foreground">
          {icon}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-sm leading-7">{description}</CardDescription>
        </div>
        <div className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {stats.map((stat) => (
            <span key={stat} className="border border-border bg-background/65 px-3 py-2">
              {stat}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 md:px-6 md:pb-6">
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={href}>
            Open {title.toLowerCase()}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function OverviewCardSkeleton() {
  return (
    <Card className="border-border bg-card/92 shadow-md backdrop-blur">
      <CardHeader className="gap-4 p-5 md:p-6">
        <Skeleton className="h-11 w-11" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-full max-w-xs" />
        <Skeleton className="h-5 w-full max-w-xs" />
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 md:px-6 md:pb-6">
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
