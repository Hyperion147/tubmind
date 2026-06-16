"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { ArrowRight, Eye, ListChecks, MessageSquareOff, UserRound } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { AdminCommentModerationPanel } from "@/features/admin/components/admin-comment-moderation-panel";

type CommentStatus = "visible" | "hidden" | "deleted";

type CommentRow = {
  id: string;
  body: string;
  status: CommentStatus;
  ideaId: string;
  ideaSlug: string;
  ideaTitle: string;
  ideaVisibility: "private" | "public";
  authorName: string;
  authorEmail: string;
  updatedAtLabel: string;
};

type CommentLog = {
  id: string;
  action: string;
  note: string | null;
  createdAtLabel: string;
  label: string;
};

type Props = {
  initialComments: CommentRow[];
  initialLogs: CommentLog[];
  initialStats: {
    totalComments: number;
    hiddenComments: number;
    deletedComments: number;
  };
  filters: {
    commentQuery: string;
    commentStatusFilter: "all" | CommentStatus;
  };
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

function matchesCommentFilters(
  comment: Pick<CommentRow, "status">,
  filters: Props["filters"]
) {
  return (
    filters.commentStatusFilter === "all" || comment.status === filters.commentStatusFilter
  );
}

export function AdminCommentsPageClient({
  initialComments,
  initialLogs,
  initialStats,
  filters,
}: Props) {
  const [comments, setComments] = useState(initialComments);
  const [logs, setLogs] = useState(initialLogs);
  const [stats, setStats] = useState(initialStats);

  const handleModerated = (
    row: CommentRow,
    result: {
      comment: { id: string; status: CommentStatus };
      log: CommentLog | null;
    }
  ) => {
    startTransition(() => {
      setStats((current) => {
        let hiddenComments = current.hiddenComments;
        let deletedComments = current.deletedComments;

        if (row.status !== result.comment.status) {
          if (row.status === "hidden") {
            hiddenComments -= 1;
          }
          if (row.status === "deleted") {
            deletedComments -= 1;
          }
          if (result.comment.status === "hidden") {
            hiddenComments += 1;
          }
          if (result.comment.status === "deleted") {
            deletedComments += 1;
          }
        }

        return {
          ...current,
          hiddenComments,
          deletedComments,
        };
      });

      setComments((current) => {
        const nextRow: CommentRow = {
          ...row,
          status: result.comment.status,
        };

        if (!matchesCommentFilters(nextRow, filters)) {
          return current.filter((item) => item.id !== row.id);
        }

        return current.map((item) => (item.id === row.id ? nextRow : item));
      });

      const nextLog = result.log;

      if (nextLog) {
        setLogs((current) => [nextLog, ...current].slice(0, 8));
      }
    });
  };

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
        <Card className="border-border bg-card/90 shadow-xl backdrop-blur">
          <CardHeader className="p-5 md:p-6">
            <Badge variant="outline" className="w-fit px-2.5 py-0.5 font-mono">
              Comment Moderation
            </Badge>
            <div className="max-w-4xl space-y-2">
              <CardTitle className="font-semibold leading-[0.98] tracking-tight text-foreground md:text-4xl">
                Keep public discussion useful without reloading the whole admin area.
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 md:text-base">
                Comment review now lives on its own page, so cleanup actions feel lighter and the discussion queue stays focused.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-3 md:p-6 md:pt-0">
            <AdminStat label="Total" value={stats.totalComments} />
            <AdminStat label="Hidden" value={stats.hiddenComments} />
            <AdminStat label="Deleted" value={stats.deletedComments} />
          </CardContent>
        </Card>

        <Card className="border-border bg-secondary/80 shadow-xl backdrop-blur">
          <CardHeader className="gap-3 p-5 md:p-6">
            <div className="flex size-10 items-center justify-center border border-border bg-background/70 text-foreground">
              <MessageSquareOff className="size-4" />
            </div>
            <CardTitle className="text-xl">Discussion filters</CardTitle>
            <CardDescription className="text-sm leading-6">
              Search by comment body, author, or idea title, then focus on hidden or deleted states when needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 md:px-6 md:pb-6">
            <form action="/admin/comments" className="grid gap-3">
              <Input
                name="commentQ"
                defaultValue={filters.commentQuery}
                placeholder="Search comment, author, or idea title..."
                className="h-11 bg-card/80"
              />
              <Button
                type="submit"
                name="commentStatus"
                value={filters.commentStatusFilter === "hidden" ? "all" : "hidden"}
                variant={filters.commentStatusFilter === "hidden" ? "default" : "outline"}
                className="justify-between"
              >
                Hidden
                <MessageSquareOff className="size-4" />
              </Button>
              <Button
                type="submit"
                name="commentStatus"
                value={filters.commentStatusFilter === "deleted" ? "all" : "deleted"}
                variant={filters.commentStatusFilter === "deleted" ? "default" : "outline"}
                className="justify-between"
              >
                Deleted
                <ListChecks className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
        <Card className="border-border bg-card/92 shadow-xl backdrop-blur">
          <CardHeader className="flex-row items-start justify-between gap-4 p-5 md:p-6">
            <div>
              <Badge variant="outline" className="mb-3 px-2.5 py-0.5 font-mono">
                Discussion Queue
              </Badge>
              <CardTitle className="text-2xl">Comments</CardTitle>
              <CardDescription className="mt-2 text-sm leading-6">
                Hide when you want reversible cleanup. Delete when the content should not return.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="px-2.5 py-1.5 font-mono">
              {comments.length} shown
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5 pt-0 md:px-6 md:pb-6">
            {comments.length === 0 ? (
              <div className="bg-background/55 p-6 text-sm text-muted-foreground ring-1 ring-border/35">
                No comments matched the current moderation filters.
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="grid gap-4 bg-background/55 p-4 shadow-sm ring-1 ring-border/35 xl:grid-cols-[1fr_320px]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {comment.status}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        {comment.ideaVisibility}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-foreground">{comment.ideaTitle}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{comment.body}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="size-4" />
                        {comment.authorName}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                        {comment.authorEmail}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                        {comment.updatedAtLabel}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/ideas/${comment.ideaId}`} className="gap-2">
                          Private idea
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      {comment.ideaVisibility === "public" ? (
                        <Button asChild variant="outline">
                          <Link href={`/ideas/${comment.ideaSlug}`} className="gap-2">
                            Public page
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <AdminCommentModerationPanel
                    commentId={comment.id}
                    currentStatus={comment.status}
                    onModerated={(result) => handleModerated(comment, result)}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/88 shadow-sm backdrop-blur">
          <CardHeader className="gap-3 p-5 md:p-6">
            <CardTitle className="text-xl">Recent comment actions</CardTitle>
            <CardDescription className="text-sm leading-6">
              Hidden and deleted discussion actions show up here as soon as they land.
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
              Discussion cleanup stays separate now, so comment review no longer waits on user management data.
            </p>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-background/70 p-3 transition-colors duration-300 hover:border-primary/35 hover:bg-background">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
