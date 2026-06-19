import Link from "next/link";
import {
  ArrowRight,
  Eye,
  ListChecks,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { AdminIdeaModerationPanel } from "@/features/admin/components/admin-idea-moderation-panel";
import type {
  IdeaStatus,
  IdeaVisibility,
} from "@tubmind/contracts/idea";

type IdeaRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: IdeaStatus;
  visibility: IdeaVisibility;
  allowComments: boolean;
  ownerName: string;
  ownerEmail: string;
  updatedAtLabel: string;
};

type IdeaLog = {
  id: string;
  action: string;
  note: string | null;
  createdAtLabel: string;
  label: string;
};

type Props = {
  initialIdeas: IdeaRow[];
  initialLogs: IdeaLog[];
  initialStats: {
    totalIdeas: number;
    publicIdeas: number;
    revisionIdeas: number;
  };
  filters: {
    query: string;
    visibilityFilter: "all" | IdeaVisibility;
    statusFilter: "all" | IdeaStatus;
  };
  pagination: {
    page: number;
    totalPages: number;
  };
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export function AdminIdeasPageClient({
  initialIdeas,
  initialLogs,
  initialStats,
  filters,
  pagination,
}: Props) {
  const ideas = initialIdeas;
  const logs = initialLogs;
  const stats = initialStats;

  const buildHref = (nextPage: number) => {
    const nextParams = new URLSearchParams();
    if (filters.query) {
      nextParams.set("q", filters.query);
    }
    if (filters.visibilityFilter !== "all") {
      nextParams.set("visibility", filters.visibilityFilter);
    }
    if (filters.statusFilter !== "all") {
      nextParams.set("status", filters.statusFilter);
    }
    if (nextPage > 1) {
      nextParams.set("page", String(nextPage));
    }

    const search = nextParams.toString();
    return search ? `/admin/ideas?${search}` : "/admin/ideas";
  };

  const hasPrevious = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;

  return (
    <div className="grid gap-4">
      <SiteBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/admin" },
          { label: "Ideas" },
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.36fr]">
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="p-5 md:p-6">
            <Badge variant="outline" className="w-fit px-2.5 py-0.5 font-mono">
              Listings Moderation
            </Badge>
            <div className="max-w-4xl space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
                Review public access, revisions, and removals.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 md:text-base">
                The ideas queue is paginated and isolated now, so listing decisions stay focused even as the project grows.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-3 md:p-6 md:pt-0">
            <AdminStat label="Total ideas" value={stats.totalIdeas} />
            <AdminStat label="Public" value={stats.publicIdeas} />
            <AdminStat label="Needs revision" value={stats.revisionIdeas} />
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/92 shadow-sm">
          <CardHeader className="gap-3 p-5 md:p-6">
            <div className="flex size-10 items-center justify-center border border-border bg-background/70 text-foreground">
              <Shield className="size-4" />
            </div>
            <CardTitle className="text-xl">Admin filters</CardTitle>
            <CardDescription className="text-sm leading-6">
              Narrow the queue by owner, title, status, or visibility without leaving the ideas panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 md:px-6 md:pb-6">
            <form action="/admin/ideas" className="grid gap-3">
              <Input
                name="q"
                defaultValue={filters.query}
                placeholder="Search title, summary, owner..."
                className="h-11 bg-card/80"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="submit"
                  name="visibility"
                  value="all"
                  variant={filters.visibilityFilter === "all" ? "default" : "outline"}
                  className="justify-between"
                >
                  All visibility
                  <Eye className="size-4" />
                </Button>
                <Button
                  type="submit"
                  name="visibility"
                  value="public"
                  variant={filters.visibilityFilter === "public" ? "default" : "outline"}
                  className="justify-between"
                >
                  Public only
                  <Sparkles className="size-4" />
                </Button>
                <Button
                  type="submit"
                  name="visibility"
                  value="private"
                  variant={filters.visibilityFilter === "private" ? "default" : "outline"}
                  className="justify-between"
                >
                  Private only
                  <Shield className="size-4" />
                </Button>
                <Button
                  type="submit"
                  name="status"
                  value="needs_revision"
                  variant={filters.statusFilter === "needs_revision" ? "default" : "outline"}
                  className="justify-between"
                >
                  Revisions
                  <ListChecks className="size-4" />
                </Button>
              </div>
              <Button type="submit" className="justify-between">
                Apply search
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.32fr]">
        <Card className="border border-border bg-card/92 shadow-sm">
          <CardHeader className="flex-row items-start justify-between gap-4 p-5 md:p-6">
            <div>
              <Badge variant="outline" className="mb-3 px-2.5 py-0.5 font-mono">
                Moderation Queue
              </Badge>
              <CardTitle className="text-2xl">Ideas</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6">
                Visibility determines public access. Status remains editorial context, while actions update in place instead of refreshing the whole page.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="px-2.5 py-1.5 font-mono">
              {ideas.length} shown
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            {ideas.length === 0 ? (
              <div className="bg-background/55 p-6 text-sm text-muted-foreground ring-1 ring-border/35">
                No ideas matched the current admin filters on this page.
              </div>
            ) : (
              ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="grid gap-4 border border-border bg-background/72 p-4 xl:grid-cols-[1fr_320px]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {idea.visibility}
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        {humanize(idea.status)}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        comments {idea.allowComments ? "on" : "off"}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-foreground">{idea.title}</h3>
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {idea.summary || "No summary added yet."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="size-4" />
                        {idea.ownerName}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                        {idea.ownerEmail}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                        {idea.updatedAtLabel}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/ideas/${idea.id}`} className="gap-2">
                          Private editor
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      {idea.visibility === "public" ? (
                        <Button asChild variant="outline">
                          <Link href={`/ideas/${idea.slug}`} className="gap-2">
                            Public page
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <AdminIdeaModerationPanel
                    ideaId={idea.id}
                    currentVisibility={idea.visibility}
                    currentStatus={idea.status}
                  />
                </div>
              ))
            )}
          </CardContent>
          {pagination.totalPages > 1 ? (
            <CardFooter className="border-t border-border/70 px-5 py-4 md:px-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={hasPrevious ? buildHref(pagination.page - 1) : "#"}
                      aria-disabled={!hasPrevious}
                      className={!hasPrevious ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href={buildHref(pageNumber)}
                          isActive={pageNumber === pagination.page}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href={hasNext ? buildHref(pagination.page + 1) : "#"}
                      aria-disabled={!hasNext}
                      className={!hasNext ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          ) : null}
        </Card>

        <Card className="border border-border bg-card/88 shadow-sm">
          <CardHeader className="gap-3 p-5 md:p-6">
            <CardTitle className="text-xl">Recent admin actions</CardTitle>
            <CardDescription className="text-sm leading-6">
              Fresh listing actions land here immediately, so the queue feels live instead of post-refresh.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            {logs.length === 0 ? (
              <div className="bg-background/55 p-4 text-sm text-muted-foreground ring-1 ring-border/35">
                No moderation actions logged yet.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-background/55 p-4 ring-1 ring-border/35">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {humanize(log.action)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{log.label}</p>
                  {log.note ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{log.note}</p>
                  ) : null}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {log.createdAtLabel}
                  </p>
                </div>
              ))
            )}
          </CardContent>
          <Separator />
          <CardFooter className="px-5 py-4 md:px-6">
            <p className="text-sm text-muted-foreground">
              Use revision when an idea needs work. Use private to pull it from public view without deleting it.
            </p>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-background/70 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
