import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FilePenLine,
} from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { taskStatusMeta } from "@/features/workspace/lib/task-status";
import { getCurrentSession } from "@/lib/auth";
import { formatRelativeBucket, formatShortDate, humanize, isTaskOverdue } from "@/features/workspace/lib/formatters";
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";
import { getTaskById } from "@/features/workspace/lib/workspace-model";

type PageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function DashboardTaskDetailPage({ params }: PageProps) {
  const { taskId } = await params;
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const workspace = await getDashboardWorkspace(session.profile.id);
  const task = getTaskById(workspace.tasks, taskId);

  if (!task) {
    notFound();
  }

  const idea = workspace.ideas.find((item) => item.id === task.ideaId);
  const StatusIcon = taskStatusMeta[task.status].icon;

  return (
    <div className="grid gap-4">
      <SiteBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tasks", href: "/dashboard/tasks" },
          { label: task.title },
        ]}
      />

      <section className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card/92 p-5 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono">
              Task detail
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{task.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {task.description ||
              "This task does not have a longer description yet, so the detail view focuses on scheduling and idea context."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="ghost">
            <Link href="/dashboard/tasks" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to tasks
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/tubs/${task.ideaId}`} className="gap-2">
              Edit idea
              <FilePenLine className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="border-border bg-card/94 shadow-xl">
          <CardHeader className="gap-3 p-5">
            <CardTitle className="text-2xl">Task snapshot</CardTitle>
            <CardDescription>
              The detail view keeps task context connected to the idea it belongs to.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5 pt-0">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailTile icon={StatusIcon} label="Status" value={taskStatusMeta[task.status].label} />
              <DetailTile icon={Clock3} label="Timing bucket" value={formatRelativeBucket(task)} />
              <DetailTile icon={CalendarDays} label="Planned date" value={formatShortDate(task.date)} />
              <DetailTile icon={CheckCircle2} label="Deadline" value={formatShortDate(task.deadline)} />
            </div>

            <div className="border border-border bg-background/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Delivery notes
              </p>
              <p className="mt-3 text-sm leading-7 text-foreground">
                {task.description || "No notes yet. Open the related idea to add context, images, or refine this task through the workflow."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-secondary shadow-xl">
          <CardHeader className="gap-3 p-5">
            <CardTitle className="text-2xl">Related idea</CardTitle>
            <CardDescription>
              This is the idea this task belongs to.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5 pt-0">
            <div className="border border-border bg-background/70 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono">
                  {idea?.visibility ?? "private"}
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  {idea ? humanize(idea.status) : "draft"}
                </Badge>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-foreground">{task.ideaTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {idea?.summary || "No summary yet."}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <span>Timeline: {idea?.timeline || "Not set"}</span>
                <span>Space type: {idea?.spaceType || "Not set"}</span>
              </div>
            </div>

            <div className="grid gap-3">
              <Button asChild>
                <Link href={`/dashboard/tubs/${task.ideaId}`} className="justify-between">
                  Edit idea
                  <FilePenLine className="size-4" />
                </Link>
              </Button>
              {task.ideaVisibility === "public" ? (
                <Button asChild variant="outline">
                  <Link href={`/ideas/${task.ideaSlug}`} className="justify-between">
                    Public page
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border bg-background/70 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
