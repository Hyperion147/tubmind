import Link from "next/link";
import {
    ArrowRight,
    Bath,
    FilePenLine,
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
import { getDashboardWorkspace } from "@/features/workspace/lib/get-dashboard-workspace";
import { formatShortDate, humanize } from "@/features/workspace/lib/formatters";
import type { WorkspaceIdea } from "@/features/workspace/lib/workspace-model";
import { getCurrentSession } from "@/lib/auth";

type PageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

export default async function DashboardIdeasPage({ searchParams }: PageProps) {
    const session = await getCurrentSession();

    if (!session) {
        return null;
    }

    const params = await searchParams;
    const query = params.q?.trim() ?? "";
    const workspace = await getDashboardWorkspace(session.profile.id);
    const filteredIdeas = filterIdeas(workspace.ideas, query);
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

            <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
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
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-2 w-full">
                                <div className="flex justify-between w-full items-center gap-2">
                                    <CardTitle className="text-[2rem] font-semibold tracking-tight text-foreground">
                                        Your ideas
                                    </CardTitle>
                                    <Badge
                                        variant="secondary"
                                        className="px-3 text-sm"
                                    >
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
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-none"
                            >
                                <Link
                                    href="/dashboard/projects"
                                    className="gap-2"
                                >
                                    View project framing
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
        <div className="grid gap-4 border border-border bg-background/72 p-4 xl:grid-cols-[1.25fr_0.75fr_auto] xl:items-center">
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-mono">
                        {humanize(idea.status)}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                        {idea.visibility}
                    </Badge>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                        {idea.title}
                    </h2>
                    <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
                        {idea.summary || "No summary added yet."}
                    </p>
                </div>
            </div>

            <div className="grid gap-2 grid-cols-2 text-sm text-muted-foreground sm:grid-cols-4 xl:grid-cols-1">
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

            <div className="flex xl:flex-col justify-between h-full items-end">
                <p className="text-sm text-muted-foreground">
                    Updated {formatShortDate(idea.updatedAt)}
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button asChild variant="fill2" className="rounded-none">
                        <Link
                            href={`/dashboard/ideas/${idea.id}`}
                            className="gap-2"
                        >
                            <FilePenLine className="size-4" />
                            <span>Edit</span>
                        </Link>
                    </Button>
                    <Button asChild className="rounded-none" variant="fill">
                        <Link
                            href={`/dashboard/projects/${idea.id}`}
                            className="gap-2"
                        >
                            <span>Open tub</span>
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>
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
        <span className="inline-flex items-center gap-2 px-2">
            <Icon className="size-4" />
            {label}
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
