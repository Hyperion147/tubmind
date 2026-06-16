import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Bath,
  CheckCircle2,
  Layers3,
  MessageSquareText,
  ShieldCheck,
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
import {
  ideaComments,
  ideaDetails,
  ideaFeatures,
  ideas,
  ideaTechStacks,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AuthRequiredPanel } from "@/features/auth/components/auth-required-panel";
import { IdeaCommentsSection } from "@/features/ideas/components/idea-comments-section";
import { IdeaSkeletonForm } from "@/features/ideas/components/idea-skeleton-form";

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export async function DashboardIdeaDetailPage({ id }: { id: string }) {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <AuthRequiredPanel
        title="Sign in to edit this idea"
        description="The private editing form, comments, and idea controls only open inside an authenticated workspace."
        next={`/dashboard/ideas/${id}`}
      />
    );
  }

  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);

  if (!idea) {
    notFound();
  }

  const isOwner = session.profile.id === idea.ownerId;
  const isAdmin = session.profile.role === "admin";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const [details, features, techStacks, comments] = await Promise.all([
    db.select().from(ideaDetails).where(eq(ideaDetails.ideaId, id)).limit(1),
    db.select().from(ideaFeatures).where(eq(ideaFeatures.ideaId, id)),
    db.select().from(ideaTechStacks).where(eq(ideaTechStacks.ideaId, id)),
    db
      .select()
      .from(ideaComments)
      .where(and(eq(ideaComments.ideaId, id), eq(ideaComments.status, "visible"))),
  ]);

  const detail = details[0];

  return (
    <div className="grid gap-4">
      <section className="border border-border bg-card/92 p-4 shadow-sm backdrop-blur md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Edit idea
              </Badge>
              <Badge variant="secondary" className="font-mono">
                {humanize(idea.status)}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {idea.visibility}
              </Badge>
            </div>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {idea.title}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {idea.summary ||
                "Edit the idea in one pass. Start with the title and summary, then move down the form."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[30rem]">
            <CompactStat label="Status" value={humanize(idea.status)} icon={CheckCircle2} />
            <CompactStat label="Visibility" value={idea.visibility} icon={ShieldCheck} />
            <CompactStat label="Features" value={String(features.length)} icon={Layers3} />
            <CompactStat label="Comments" value={String(comments.length)} icon={MessageSquareText} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/projects/${idea.id}`} className="gap-2">
              Open idea tub
              <Bath className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Card className="border-border bg-card/94 shadow-xl backdrop-blur">
        <CardHeader className="gap-2 p-4 md:p-5">
          <CardTitle className="text-2xl">Edit details</CardTitle>
          <CardDescription className="leading-6">
            A linear form for peaceful editing: fill what you know, skip what you do not.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-5 md:pt-0">
          <IdeaSkeletonForm
            ideaId={idea.id}
            initialValues={{
              title: idea.title,
              summary: idea.summary ?? "",
              description: idea.description ?? "",
              progressNotes: idea.progressNotes ?? "",
              status: idea.status,
              visibility: idea.visibility === "public" ? "public" : "private",
              allowComments: idea.allowComments,
              problem: detail?.problem ?? "",
              targetAudience: detail?.targetAudience ?? "",
              designStyle: detail?.designStyle ?? "",
              budgetRange: detail?.budgetRange ?? "",
              timeline: detail?.timeline ?? "",
              spaceType: detail?.spaceType ?? "",
              features: features.map((feature) => ({
                label: feature.label,
                description: feature.description ?? "",
                isCompleted: feature.isCompleted,
              })),
              techStacks: techStacks.map((tech) => ({
                name: tech.name,
                category: tech.category ?? "",
                notes: tech.notes ?? "",
              })),
            }}
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.45fr]">
        <Card className="border-border bg-card/88 shadow-sm backdrop-blur">
          <CardHeader className="p-4 md:p-5">
            <CardTitle className="text-xl">Public preview</CardTitle>
            <CardDescription className="leading-6">
              Check the public route once the idea is visible.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 pt-0 md:p-5 md:pt-0">
            <div className="border border-border bg-background/70 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                /ideas/{idea.slug}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {idea.summary || "Add a summary so the public card and page read clearly."}
              </p>
            </div>
            {idea.visibility === "public" ? (
              <Button asChild>
                <Link href={`/ideas/${idea.slug}`} className="justify-between">
                  Open public page
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <div className="border border-dashed border-border bg-background/50 p-3 text-sm text-muted-foreground">
                Set visibility to `public` to make this route live.
              </div>
            )}
          </CardContent>
        </Card>

        <IdeaCommentsSection
          ideaId={idea.id}
          comments={comments}
          isAuthenticated={Boolean(session)}
          allowComments={idea.allowComments}
          nextPath={`/dashboard/ideas/${idea.id}`}
          canDeleteComments={isOwner || isAdmin}
        />
      </section>
    </div>
  );
}

function CompactStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="min-w-0 border border-border bg-background/70 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-2 truncate text-sm font-semibold capitalize text-foreground">{value}</p>
    </div>
  );
}
