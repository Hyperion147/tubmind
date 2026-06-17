import Link from "next/link";
import { ArrowLeft, ExternalLink, FilePenLine } from "lucide-react";

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
import { DeleteIdeaButton } from "@/features/ideas/components/delete-idea-button";
import { IdeaSkeletonForm } from "@/features/ideas/components/idea-skeleton-form";
import { humanize } from "@/features/workspace/lib/formatters";

import { IdeaTubPage } from "./idea-tub-page";
import type { getTubDetailData } from "../lib/tub-detail-data";

type TubDetailData = NonNullable<Awaited<ReturnType<typeof getTubDetailData>>>;

export function TubDetailPage({ data }: { data: TubDetailData }) {
  const { idea, detail, features, techStacks, comments, tubData } = data;

  return (
    <div className="grid gap-4">
      <SiteBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tubs", href: "/dashboard/tubs" },
          { label: idea.title },
        ]}
      />

      <section className="border border-border bg-card/92 p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono">
                Idea tub
              </Badge>
              <Badge variant="secondary" className="font-mono">
                {humanize(idea.status)}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {idea.visibility}
              </Badge>
            </div>
            <div className="space-y-2">
              <h1 className="truncate text-3xl font-semibold tracking-tight text-foreground">
                {idea.title}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {idea.summary ||
                  "Shape the idea, edit its details, and manage the task tub from one focused surface."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="ghost">
              <Link href="/dashboard/tubs" className="gap-2">
                <ArrowLeft className="size-4" />
                Tubs
              </Link>
            </Button>
            {idea.visibility === "public" ? (
              <Button asChild variant="outline">
                <Link href={`/ideas/${idea.slug}`} className="gap-2">
                  Public page
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <Card className="border-border bg-card/94 shadow-sm">
          <CardHeader className="gap-2 p-5">
            <div className="flex items-center gap-2">
              <FilePenLine className="size-4 text-muted-foreground" />
              <CardTitle className="text-2xl">Edit idea</CardTitle>
            </div>
            <CardDescription className="leading-6">
              Keep the idea record and the tub work aligned.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
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

        <Card className="border-border bg-card/92 shadow-sm">
          <CardHeader className="gap-2 p-5">
            <CardTitle className="text-2xl">Idea controls</CardTitle>
            <CardDescription className="leading-6">
              Delete is permanent and removes this idea with its dependent rows.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <InfoTile label="Features" value={String(features.length)} />
              <InfoTile label="Comments" value={String(comments.length)} />
              <InfoTile label="Tasks" value={String(tubData.tasks.length)} />
              <InfoTile label="Visibility" value={idea.visibility} />
            </div>
            <DeleteIdeaButton ideaId={idea.id} />
          </CardContent>
        </Card>
      </section>

      <IdeaTubPage
        idea={{
          id: idea.id,
          slug: idea.slug,
          title: idea.title,
          summary: idea.summary,
          status: idea.status,
          visibility: idea.visibility,
          updatedAt: idea.updatedAt.toISOString(),
        }}
        initialTubData={tubData}
      />
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border border-border bg-background/70 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-semibold capitalize text-foreground">
        {value}
      </p>
    </div>
  );
}
