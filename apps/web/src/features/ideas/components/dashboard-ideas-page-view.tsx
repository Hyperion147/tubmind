import Link from "next/link";
import {
    ArrowRight,
    Bath,
    Lightbulb,
    MessageSquareText,
    Search,
    Sparkles,
} from "lucide-react";

import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateIdeaForm } from "@/features/ideas/components/create-idea-form";
import { formatShortDate, humanize } from "@/features/workspace/lib/formatters";
import type { WorkspaceIdea } from "@/features/workspace/lib/workspace-model";

type DashboardIdeasPageViewProps = {
    ideas: WorkspaceIdea[];
    query: string;
};

export function DashboardIdeasPageView({
    ideas,
    query,
}: DashboardIdeasPageViewProps) {
    const filteredIdeas = filterIdeas(ideas, query);

    return (
        <div className="grid gap-4 xl:gap-5">
            <SiteBreadcrumb
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Ideas" },
                ]}
            />

            <section className="grid gap-5 border border-border bg-card/90 p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground xl:text-[2.25rem]">
                            Ideas
                        </h1>
                    </div>

                    <form
                        action="/dashboard/ideas"
                        className="flex w-full flex-col gap-3 xl:max-w-lg xl:flex-row"
                    >
                        <label className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                defaultValue={query}
                                placeholder="Search ideas by title or keyword..."
                                className="h-11 bg-background pl-11"
                            />
                        </label>
                    </form>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
                <Card
                    id="create-idea"
                    className="border border-border bg-card/92 shadow-sm"
                >
                    <CardContent>
                        <CreateIdeaForm isAuthenticated variant="ideas-page" />
                    </CardContent>
                </Card>

                <Card className="border border-border bg-card/92 shadow-sm">
                    <CardHeader className="border-b border-border">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                                    Your ideas
                                </CardTitle>
                                <Badge variant="secondary" className="px-3 text-sm">
                                    {filteredIdeas.length} ideas
                                </Badge>
                            </div>
                            {query ? (
                                <p className="text-sm text-muted-foreground">
                                    Showing results for{" "}
                                    <span className="font-medium text-foreground">
                                        &ldquo;{query}&rdquo;
                                    </span>
                                    .
                                </p>
                            ) : null}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {filteredIdeas.length === 0 ? (
                            <LargeEmptyState
                                title={
                                    query
                                        ? "No ideas match this search"
                                        : "More ideas coming soon"
                                }
                                copy={
                                    query
                                        ? "Try another title or keyword, or clear the search to see every idea in your workspace."
                                        : "Capture more ideas and they'll appear here."
                                }
                            />
                        ) : (
                            <div className="grid gap-4">
                                {filteredIdeas.map((idea) => (
                                    <IdeaListRow key={idea.id} idea={idea} />
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end border-t border-border pt-4">
                            <Button asChild variant="outline" className="rounded-none">
                                <Link href="/dashboard/tubs" className="gap-2">
                                    View all tubs
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function IdeaListRow({ idea }: { idea: WorkspaceIdea }) {
    return (
        <div className="grid gap-4 border border-border bg-background/72 p-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_auto] xl:items-center">
            <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-mono">
                        {humanize(idea.status)}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                        {idea.visibility}
                    </Badge>
                </div>
                <div className="space-y-2">
                    <h2 className="truncate text-xl font-semibold text-foreground">
                        {idea.title}
                    </h2>
                    <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
                        {idea.summary || "No summary added yet."}
                    </p>
                </div>
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4 xl:grid-cols-1">
                <InlineStat icon={Bath} label={`${idea.tasks.length} tasks`} />
                <InlineStat
                    icon={MessageSquareText}
                    label={`${idea.comments} comments`}
                />
                <InlineStat icon={Sparkles} label={`${idea.likes} likes`} />
                <InlineStat
                    icon={Lightbulb}
                    label={`Created ${formatShortDate(idea.createdAt)}`}
                />
            </div>

            <div className="flex h-full flex-wrap items-end justify-between gap-3 xl:flex-col">
                <p className="text-sm text-muted-foreground">
                    Updated {formatShortDate(idea.updatedAt)}
                </p>
                <Button asChild className="rounded-none" variant="fill">
                    <Link href={`/dashboard/tubs/${idea.id}`} className="gap-2">
                        <span>View tub</span>
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function InlineStat({
    icon: Icon,
    label,
}: {
    icon: typeof Bath;
    label: string;
}) {
    return (
        <span className="inline-flex min-w-0 items-center gap-2 px-2">
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
        </span>
    );
}

function LargeEmptyState({ title, copy }: { title: string; copy: string }) {
    return (
        <div className="grid min-h-[17rem] place-items-center border border-border bg-background/55 p-8 text-center">
            <div className="space-y-4">
                <div className="mx-auto flex size-16 items-center justify-center bg-secondary text-primary">
                    <Lightbulb className="size-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h3>
                    <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                        {copy}
                    </p>
                </div>
            </div>
        </div>
    );
}

function filterIdeas(ideas: WorkspaceIdea[], query: string) {
    if (!query) {
        return ideas;
    }

    const normalized = query.toLowerCase();

    return ideas.filter((idea) => {
        const haystack = [
            idea.title,
            idea.summary,
            idea.spaceType,
            idea.targetAudience,
            idea.problem,
            idea.timeline,
            idea.status,
            idea.visibility,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(normalized);
    });
}
