import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft, FilePenLine, Globe2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { ideaDetails, ideas } from "@/db/schema";
import { AuthRequiredPanel } from "@/features/auth/components/auth-required-panel";
import { IdeaTubPage } from "@/features/tub/components/idea-tub-page";
import { getCurrentSession } from "@/lib/auth";
import { normalizeIdeaTubData } from "@/lib/tub";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export default async function DashboardProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getCurrentSession();

  if (!session) {
    return (
      <AuthRequiredPanel
        title="Sign in to open this project"
        description="The private task tub, calendar planning, and idea controls only open inside an authenticated workspace."
        next={`/dashboard/projects/${id}`}
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

  const [detail] = await db
    .select()
    .from(ideaDetails)
    .where(eq(ideaDetails.ideaId, id))
    .limit(1);

  const tubData = normalizeIdeaTubData(
    (detail?.metadata as Record<string, unknown> | null | undefined)?.tub,
  );

  return (
    <div className="grid gap-4">
      <section className="flex flex-wrap items-start justify-between gap-3 border border-border bg-card/92 p-5 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="font-mono">
              <Link href="/dashboard/projects" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-3.5" />
                Projects
              </Link>
            </Badge>
            <Badge variant="outline" className="font-mono">
              Project tub
            </Badge>
            <Badge variant="secondary" className="font-mono">
              {humanize(idea.status)}
            </Badge>
            <Badge variant="outline" className="font-mono">
              {idea.visibility}
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{idea.title}</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {idea.summary ||
              "This project view keeps the tub inside the dashboard so planning, tasks, and idea edits live under one parent section."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/ideas/${idea.id}`} className="gap-2">
              <FilePenLine className="size-4" />
              Edit idea
            </Link>
          </Button>
          {idea.visibility === "public" ? (
            <Button asChild variant="ghost">
              <Link href={`/ideas/${idea.slug}`} className="gap-2">
                <Globe2 className="size-4" />
                Public page
              </Link>
            </Button>
          ) : null}
        </div>
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
