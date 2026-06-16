"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  FolderKanban,
  FolderOpenDot,
  ListTodo,
  MessageSquareText,
  Search,
  Sparkles,
} from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUrlSearchState } from "@/hooks/use-url-search-state";
import { cn } from "@/lib/utils";

import { formatShortDate, humanize, isTaskOverdue } from "../lib/formatters";
import { getProjectTaskHref, type WorkspaceIdea } from "../lib/workspace-model";

type ProjectsPageClientProps = {
  ideas: WorkspaceIdea[];
  initialFilters: {
    query: string;
    view: "projects" | "tasks";
    selectedIdeaId: string;
  };
};

export function ProjectsPageClient({ ideas, initialFilters }: ProjectsPageClientProps) {
  const { isPending, searchParams, setSearchParams } = useUrlSearchState();
  const query = searchParams.get("q") ?? initialFilters.query;
  const view = searchParams.get("view") === "tasks" ? "tasks" : initialFilters.view;
  const selectedIdeaId = searchParams.get("idea") ?? initialFilters.selectedIdeaId;

  const filteredIdeas = useMemo(() => {
    if (!query.trim()) {
      return ideas;
    }

    const search = query.toLowerCase();
    return ideas.filter((idea) =>
      [idea.title, idea.summary ?? "", idea.problem ?? "", idea.targetAudience ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [ideas, query]);

  const filteredTasks = useMemo(() => {
    const search = query.toLowerCase();
    return ideas
      .flatMap((idea) => idea.tasks)
      .filter((task) => {
        if (selectedIdeaId !== "all" && task.ideaId !== selectedIdeaId) {
          return false;
        }

        if (!query.trim()) {
          return true;
        }

        return [task.title, task.description, task.ideaTitle].join(" ").toLowerCase().includes(search);
      });
  }, [ideas, query, selectedIdeaId]);

  return (
    <div className="grid gap-4">
      <SiteBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects" },
        ]}
      />

      <section className="border border-border bg-card/92 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="font-mono">
              Projects
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Idea portfolio
              </h1>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] xl:w-[34rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setSearchParams({
                    q: nextQuery.trim() ? nextQuery : null,
                  });
                }}
                placeholder="Search ideas or tasks"
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["projects", "tasks"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={view === option ? "fill" : "fill2"}
                  onClick={() => {
                    setSearchParams({
                      view: option === "tasks" ? "tasks" : null,
                    });
                  }}
                  className="capitalize gap-2"
                >
                  {option === "projects" ? (
                    <FolderOpenDot className="size-4" />
                  ) : (
                    <CheckCheck className="size-4" />
                  )}
                  <span>{option}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        {isPending ? (
          <p className="mt-4 text-sm text-muted-foreground">Updating view...</p>
        ) : null}
      </section>

      {view === "projects" ? (
        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredIdeas.length === 0 ? (
            <EmptyState
              title="No matching ideas"
              description="Try a different search or create a new idea from the dashboard overview."
            />
          ) : (
            filteredIdeas.map((idea) => {
              const completedCount = idea.tasks.filter((task) => task.status === "completed").length;
              const overdueCount = idea.tasks.filter(isTaskOverdue).length;

              return (
                <Card key={idea.id} className="border-border bg-card shadow-xl backdrop-blur">
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {humanize(idea.status)}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {idea.visibility}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{idea.title}</CardTitle>
                        <CardDescription>
                          {idea.summary || "Add a summary to this project"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <MiniStat icon={ListTodo} label="Tasks" value={String(idea.tasks.length)} />
                      <MiniStat icon={CheckCircle2} label="Done" value={String(completedCount)} />
                      <MiniStat icon={Sparkles} label="Likes" value={String(idea.likes)} />
                      <MiniStat icon={MessageSquareText} label="Comments" value={String(idea.comments)} />
                    </div>

                    <div className="grid gap-2 border border-border bg-background/60 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-foreground">
                          {formatShortDate(idea.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Timeline</span>
                        <span className="font-medium text-foreground">
                          {idea.timeline || "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Last updated</span>
                        <span className="font-medium text-foreground">
                          {formatShortDate(idea.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Overdue tasks</span>
                        <span
                          className={cn(
                            "font-medium",
                            overdueCount > 0 ? "text-destructive" : "text-foreground",
                          )}
                        >
                          {overdueCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/ideas/${idea.id}`}>Edit idea</Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/dashboard/projects/${idea.id}`}>Open tub</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>
      ) : (
        <section className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={selectedIdeaId === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSearchParams({
                  idea: null,
                });
              }}
            >
              All ideas
            </Button>
            {ideas.map((idea) => (
              <Button
                key={idea.id}
                type="button"
                variant={selectedIdeaId === idea.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSearchParams({
                    idea: idea.id,
                  });
                }}
              >
                {idea.title}
              </Button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No matching tasks"
              description="Try clearing the project filter or adding tasks inside an idea tub."
            />
          ) : (
            filteredTasks.map((task) => (
              <Link
                key={task.id}
                href={getProjectTaskHref(task)}
                className="grid gap-2 border bg-card/92 p-6 transition-colors"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {task.ideaTitle}
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        {humanize(task.status)}
                      </Badge>
                      {isTaskOverdue(task) ? (
                        <Badge variant="destructive" className="font-mono">
                          Overdue
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {task.description || "No extra notes on this tub task yet."}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-end text-muted-foreground md:min-w-48">
                    <div className="flex justify-end items-center gap-2">
                      <CalendarDays className="size-4" />
                      <span>{formatShortDate(task.deadline ?? task.date)}</span>
                    </div>
                    <span>Planned day: {formatShortDate(task.date)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border bg-background/70 py-2 px-3 flex justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="font-semibold text-foreground">{value}</p>
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
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
