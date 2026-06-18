"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CheckCircle2,
  FolderOpenDot,
  ListTodo,
  MessageSquareText,
  Search,
  Sparkles,
} from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUrlSearchState } from "@/hooks/use-url-search-state";
import { cn } from "@/lib/utils";

import { formatShortDate, humanize, isTaskOverdue } from "../../workspace/lib/formatters";
import type { WorkspaceIdea } from "../../workspace/lib/workspace-model";

type TubPageClientProps = {
  ideas: WorkspaceIdea[];
  initialQuery: string;
};

export function TubPageClient({ ideas, initialQuery }: TubPageClientProps) {
  const { isPending, searchParams, setSearchParams } = useUrlSearchState();
  const query = searchParams.get("q") ?? initialQuery;

  const filteredIdeas = useMemo(() => {
    if (!query.trim()) {
      return ideas;
    }

    const search = query.toLowerCase();
    return ideas.filter((idea) =>
      [
        idea.title,
        idea.summary ?? "",
        idea.problem ?? "",
        idea.targetAudience ?? "",
        idea.timeline ?? "",
        idea.spaceType ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [ideas, query]);

  return (
    <div className="grid gap-4">
      <SiteBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tubs" },
        ]}
      />

      <section className="border border-border bg-card/92 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="font-mono">
              Tubs
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Idea tubs
            </h1>
          </div>

          <div className="relative xl:w-[28rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setSearchParams({
                  q: nextQuery.trim() ? nextQuery : null,
                });
              }}
              placeholder="Search tubs"
              className="h-11 bg-background pl-10"
            />
          </div>
        </div>
        {isPending ? (
          <p className="mt-4 text-sm text-muted-foreground">Updating tubs...</p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredIdeas.length === 0 ? (
          <EmptyState
            title="No matching tubs"
            description="Try another search or capture a new idea first."
          />
        ) : (
          filteredIdeas.map((idea) => {
            const completedCount = idea.tasks.filter(
              (task) => task.status === "completed",
            ).length;
            const overdueCount = idea.tasks.filter(isTaskOverdue).length;

            return (
              <Card
                key={idea.id}
                className="border-border bg-card shadow-sm backdrop-blur"
              >
                <CardHeader className="gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {humanize(idea.status)}
                        </Badge>
                        <Badge variant="outline" className="font-mono">
                          {idea.visibility}
                        </Badge>
                      </div>
                      <CardTitle className="truncate text-xl">
                        {idea.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {idea.summary || "Add a summary to this tub"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 p-5 pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat
                      icon={ListTodo}
                      label="Tasks"
                      value={String(idea.tasks.length)}
                    />
                    <MiniStat
                      icon={CheckCircle2}
                      label="Done"
                      value={String(completedCount)}
                    />
                    <MiniStat
                      icon={Sparkles}
                      label="Likes"
                      value={String(idea.likes)}
                    />
                    <MiniStat
                      icon={MessageSquareText}
                      label="Comments"
                      value={String(idea.comments)}
                    />
                  </div>

                  <div className="grid gap-2 border border-border bg-background/60 p-3 text-sm">
                    <MetaRow label="Created" value={formatShortDate(idea.createdAt)} />
                    <MetaRow label="Timeline" value={idea.timeline || "Not set"} />
                    <MetaRow
                      label="Last updated"
                      value={formatShortDate(idea.updatedAt)}
                    />
                    <MetaRow
                      label="Overdue tasks"
                      value={String(overdueCount)}
                      destructive={overdueCount > 0}
                    />
                  </div>

                  <Button asChild className="justify-between rounded-none">
                    <Link href={`/dashboard/tubs/${idea.id}`}>
                      Open tub
                      <FolderOpenDot className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListTodo;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 justify-between gap-2 border border-border bg-background/70 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p className="shrink-0 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MetaRow({
  label,
  value,
  destructive = false,
}: {
  label: string;
  value: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "truncate text-right font-medium text-foreground",
          destructive && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-border bg-card/88">
      <CardContent className="grid place-items-center p-10 text-center">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
