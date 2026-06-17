import Link from "next/link";
import {
  ArrowRight,
  Bath,
  CheckCircle2,
  Layers3,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AppReveal } from "@/components/motion/app-reveal";
import { AppStagger } from "@/components/motion/app-stagger";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { getCurrentSession } from "@/lib/auth";
import { AuthGateOverlay } from "@/features/auth/components/auth-gate-overlay";
import { IdeaCommentsSection } from "@/features/ideas/components/idea-comments-section";
import { getPublicIdeaPageData } from "@/features/ideas/lib/public-idea-queries";
import { PublicIdeaReactionStat } from "@/features/ideas/components/public-idea-reaction-stat";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export default async function PublicIdeaPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getCurrentSession();
  const isBlocked = session?.profile.status === "blocked";
  const isLocked = !session || isBlocked;

  const data = await getPublicIdeaPageData({
    slug,
    viewerId: session?.profile.id,
  });

  if (!data) {
    notFound();
  }

  const {
    idea,
    detail,
    features,
    techStacks,
    comments,
    reactionCount,
    hasReacted,
  } = data;
  const isOwner = session?.profile.id === idea.ownerId;

  return (
    <AppProviders>
    <main className="relative min-h-screen overflow-hidden">
      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-400 flex-col gap-8 px-4 py-4 transition-[filter,opacity,transform] duration-500 md:px-6 md:py-6",
          isLocked &&
            "pointer-events-none scale-[0.998] select-none blur-[2px] opacity-70",
        )}
      >
        <AppReveal delay={0.1} y={-10} blur={10} duration={1}>
          <SiteNavbar
            title="Public Idea"
            icon={Bath}
            activeHref="/listings"
            userLabel={session?.profile.displayName}
            userAvatarUrl={session?.profile.avatarUrl}
            actions={[
              {
                label: "Back to listings",
                href: "/listings",
                variant: "outline",
                hideOnMobile: true,
              },
              {
                label: "Open dashboard",
                href: "/",
                icon: ArrowRight,
              },
            ]}
          />
        </AppReveal>

        <AppStagger className="contents" delay={0.3} stagger={0.09}>
          <AppReveal inherit y={12} blur={8} duration={0.8} className="w-full">
            <SiteBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Listings", href: "/listings" },
                { label: idea.title },
              ]}
            />
          </AppReveal>

          <AppReveal inherit y={18} blur={10} duration={1.2} className="w-full">
            <section className="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
              <Card className="border-border bg-card/90 shadow-xl backdrop-blur transition-colors duration-300 hover:border-primary/35 hover:bg-card">
                <CardHeader className="gap-6 p-6 md:px-8">
                  <Badge variant="outline" className="w-fit px-3 py-1 font-mono">
                    Public Preview
                  </Badge>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg">
                        <AvatarFallback>{getInitials(idea.ownerName)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{idea.ownerName}</p>
                        <p className="font-mono text-xs">
                          {idea.publishedAt
                            ? idea.publishedAt.toLocaleDateString()
                            : "Published"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {humanize(idea.status)}
                    </Badge>
                  </div>
                  <div className="max-w-5xl">
                    <CardTitle className="font-semibold text-foreground md:text-4xl">
                      {idea.title}
                    </CardTitle>
                    <CardDescription className="max-w-3xl text-base md:text-sm">
                      {idea.summary ||
                        idea.description ||
                        "This idea is live, but it still needs a tighter summary."}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-3 px-6 pt-0 md:grid-cols-5 md:px-8 md:pt-0">
                  <PreviewStat
                    label="Status"
                    value={humanize(idea.status)}
                    icon={CheckCircle2}
                  />
                  <PreviewStat
                    label="Visibility"
                    value={idea.visibility}
                    icon={Sparkles}
                  />
                  <PreviewStat
                    label="Features"
                    value={String(features.length)}
                    icon={Layers3}
                  />
                  <PreviewStat
                    label="Comments"
                    value={String(comments.length)}
                    icon={MessageSquareText}
                  />
                  <PublicIdeaReactionStat
                    ideaId={idea.id}
                    initialCount={reactionCount}
                    initialReacted={hasReacted}
                    isAuthenticated={Boolean(session)}
                    nextPath={`/ideas/${idea.slug}`}
                  />
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border bg-secondary/80 shadow-xl backdrop-blur transition-colors duration-300 hover:border-primary/35 hover:bg-secondary">
                <CardHeader className="relative">
                  <div className="border border-border/70 bg-background/35 p-3 backdrop-blur-sm">
                    <CardTitle className="text-2xl">At a glance</CardTitle>
                    <CardDescription className="mt-3 leading-7">
                      The public-facing view surfaces the idea summary first,
                      then details, stack, and discussion.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative grid gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="border border-border bg-background/70 px-3 py-2">
                    space: {detail?.spaceType || "not set"}
                  </span>
                  <span className="border border-border bg-background/70 px-3 py-2">
                    style: {detail?.designStyle || "not set"}
                  </span>
                  <span className="border border-border bg-background/70 px-3 py-2">
                    budget: {detail?.budgetRange || "not set"}
                  </span>
                </CardContent>
                {isOwner ? (
                  <CardFooter className="relative">
                    <Button asChild className="w-full">
                      <Link
                        href={`/dashboard/tubs/${idea.id}`}
                        className="justify-between"
                      >
                        Edit this idea
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                ) : null}
              </Card>
            </section>
          </AppReveal>

          <AppReveal
            inherit
            delay={0.3}
            y={20}
            blur={10}
            duration={1}
            className="w-full"
          >
            <section className="grid gap-4 xl:grid-cols-[1fr_0.34fr]">
              <div className="grid gap-4">
                <Card className="border-border bg-card/92 shadow-xl backdrop-blur">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit px-3 py-1 font-mono">
                      Description
                    </Badge>
                    <CardTitle className="text-3xl">
                      What this idea is trying to achieve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-8 text-muted-foreground">
                    <p>
                      {idea.description || "No long-form description added yet."}
                    </p>
                    {idea.progressNotes ? (
                      <div className="border border-border bg-background/70 p-4">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Progress notes
                        </p>
                        <p className="mt-3 text-sm leading-7">
                          {idea.progressNotes}
                        </p>
                      </div>
                    ) : null}
                    {detail?.problem ? (
                      <div className="border border-border bg-background/70 p-4">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Problem / goal
                        </p>
                        <p className="mt-3 text-sm leading-7">
                          {detail.problem}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/92 shadow-xl backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-3xl">Features</CardTitle>
                    <CardDescription className="leading-7">
                      The pieces that shape the experience and functionality of
                      this idea.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {features.length === 0 ? (
                      <div className="border border-dashed border-border bg-background/50 p-6 text-sm text-muted-foreground">
                        No features have been published yet.
                      </div>
                    ) : (
                      features.map((feature) => (
                        <div
                          key={feature.id}
                          className="border border-border bg-background/70 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-base font-semibold text-foreground">
                              {feature.label}
                            </p>
                            <Badge
                              variant={feature.isCompleted ? "secondary" : "outline"}
                              className="font-mono"
                            >
                              {feature.isCompleted ? "planned" : "open"}
                            </Badge>
                          </div>
                          {feature.description ? (
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                              {feature.description}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid content-start gap-4">
                <Card className="border-border bg-card/88 shadow-sm backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-2xl">Properties</CardTitle>
                    <CardDescription className="leading-7">
                      Snapshot details for anyone evaluating the concept quickly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="border border-border bg-secondary/65 px-3 py-2 text-secondary-foreground">
                      {detail?.spaceType || "space not set"}
                    </span>
                    <span className="border border-border bg-background/65 px-3 py-2">
                      {detail?.designStyle || "style not set"}
                    </span>
                    <span className="border border-border bg-background/65 px-3 py-2">
                      {detail?.timeline || "timeline not set"}
                    </span>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/88 shadow-sm backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-2xl">Tech stack</CardTitle>
                    <CardDescription className="leading-7">
                      Tools and systems behind the build or planning flow.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {techStacks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No stack items added yet.
                      </p>
                    ) : (
                      techStacks.map((tech) => (
                        <div
                          key={tech.id}
                          className="border border-border bg-background/70 p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-foreground">{tech.name}</p>
                            {tech.category ? (
                              <Badge variant="outline" className="font-mono">
                                {tech.category}
                              </Badge>
                            ) : null}
                          </div>
                          {tech.notes ? (
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">
                              {tech.notes}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <IdeaCommentsSection
                  ideaId={idea.id}
                  comments={comments}
                  isAuthenticated={Boolean(session)}
                  allowComments={idea.allowComments}
                  nextPath={`/ideas/${idea.slug}`}
                  commentsTargetId="public-idea-comments"
                  canDeleteComments={isOwner}
                />
              </div>
            </section>
          </AppReveal>

          <AppReveal
            inherit
            delay={0.36}
            y={20}
            blur={10}
            duration={1}
            className="w-full"
          >
            <section id="public-idea-comments" className="grid gap-4" />
          </AppReveal>
        </AppStagger>
      </div>

      {isLocked ? (
        <AuthGateOverlay
          title={
            isBlocked
              ? "This idea view is locked"
              : "Sign in to view idea details"
          }
          description={
            isBlocked
              ? "This account is currently blocked from the beta workspace. If that looks wrong, review your account status with the admin who invited you."
              : "Idea details, comments, and reactions stay behind sign-in so the workspace remains focused during the beta."
          }
          next={`/ideas/${idea.slug}`}
        />
      ) : null}
    </main>
    </AppProviders>
  );
}

function PreviewStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="border border-border bg-background/70 p-4 transition-colors duration-300 hover:border-primary/35 hover:bg-background">
      <div className="flex items-center justify-start gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 truncate text-xl font-semibold capitalize text-foreground">
        {value}
      </p>
    </div>
  );
}
