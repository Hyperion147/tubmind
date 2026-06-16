import Link from "next/link";
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
import { db } from "@/db";
import { ideaComments, ideas, profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function AdminHomePage() {
  await requireAdmin();

  const [
    totalIdeasResult,
    publicIdeasResult,
    revisionIdeasResult,
    totalUsersResult,
    blockedUsersResult,
    reviewUsersResult,
    totalCommentsResult,
    hiddenCommentsResult,
    deletedCommentsResult,
  ] = await Promise.all([
    db.select({ value: count() }).from(ideas),
    db.select({ value: count() }).from(ideas).where(eq(ideas.visibility, "public")),
    db.select({ value: count() }).from(ideas).where(eq(ideas.status, "needs_revision")),
    db.select({ value: count() }).from(profiles),
    db.select({ value: count() }).from(profiles).where(eq(profiles.status, "blocked")),
    db.select({ value: count() }).from(profiles).where(eq(profiles.status, "under_review")),
    db.select({ value: count() }).from(ideaComments),
    db.select({ value: count() }).from(ideaComments).where(eq(ideaComments.status, "hidden")),
    db.select({ value: count() }).from(ideaComments).where(eq(ideaComments.status, "deleted")),
  ]);

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 border border-border bg-card p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit font-mono">
              Admin
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Moderation dashboard
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Review ideas, accounts, and comments from the same workspace navigation.
            </p>
          </div>
          <Button asChild variant="fill" className="rounded-none">
            <Link href="/dashboard" className="gap-2">
              <span>Workspace</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <OverviewCard
          title="Ideas"
          href="/admin/ideas"
          icon={<ListChecks className="size-4" />}
          stats={[
            `${totalIdeasResult[0]?.value ?? 0} total`,
            `${publicIdeasResult[0]?.value ?? 0} public`,
            `${revisionIdeasResult[0]?.value ?? 0} revision`,
          ]}
          description="Review visibility, revision requests, and removal decisions for idea pages."
        />
        <OverviewCard
          title="Users"
          href="/admin/users"
          icon={<UserRoundCog className="size-4" />}
          stats={[
            `${totalUsersResult[0]?.value ?? 0} total`,
            `${blockedUsersResult[0]?.value ?? 0} blocked`,
            `${reviewUsersResult[0]?.value ?? 0} review`,
          ]}
          description="Moderate roles, account states, and workspace access."
        />
        <OverviewCard
          title="Comments"
          href="/admin/comments"
          icon={<AlertCircle className="size-4" />}
          stats={[
            `${totalCommentsResult[0]?.value ?? 0} total`,
            `${hiddenCommentsResult[0]?.value ?? 0} hidden`,
            `${deletedCommentsResult[0]?.value ?? 0} deleted`,
          ]}
          description="Clean up public discussion without leaving the dashboard."
        />
      </section>
    </div>
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
    <Card className="border border-border bg-card/92 shadow-sm">
      <CardHeader className="gap-4 border-b border-border p-5 md:p-6">
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
        <Button asChild variant="fill2" className="w-full justify-between rounded-none">
          <Link href={href}>
            <span>Open {title.toLowerCase()}</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
