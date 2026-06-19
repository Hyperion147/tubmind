import "server-only";

import { and, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  ideaComments,
  ideaDetails,
  ideaReactions,
  ideas,
} from "@tubmind/database";
import { normalizeIdeaTubData } from "@tubmind/domain";
import type { IdeaStatus, IdeaVisibility, WorkspaceDashboardData, WorkspaceIdea, WorkspaceTask } from "./workspace-model";

function compareIsoDate(a: string | null, b: string | null) {
  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return 1;
  }

  if (!b) {
    return -1;
  }

  return new Date(a).getTime() - new Date(b).getTime();
}

function compareTasks(a: WorkspaceTask, b: WorkspaceTask) {
  const deadlineOrder = compareIsoDate(a.deadline, b.deadline);

  if (deadlineOrder !== 0) {
    return deadlineOrder;
  }

  const dateOrder = a.date.localeCompare(b.date);

  if (dateOrder !== 0) {
    return dateOrder;
  }

  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function isDueSoon(deadline: string | null) {
  if (!deadline) {
    return false;
  }

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const dueDate = new Date(deadline);

  return dueDate >= start && dueDate <= end;
}

function enrichTasks(idea: {
  id: string;
  slug: string;
  title: string;
  status: IdeaStatus;
  visibility: IdeaVisibility;
  metadata: Record<string, unknown> | null;
}) {
  const tubData = normalizeIdeaTubData(idea.metadata?.tub);

  return tubData.tasks.map<WorkspaceTask>((task) => ({
    ...task,
    ideaId: idea.id,
    ideaSlug: idea.slug,
    ideaTitle: idea.title,
    ideaStatus: idea.status,
    ideaVisibility: idea.visibility,
  }));
}

export async function getDashboardWorkspace(ownerId: string): Promise<WorkspaceDashboardData> {
  const ideaRows = await db
    .select({
      id: ideas.id,
      slug: ideas.slug,
      title: ideas.title,
      summary: ideas.summary,
      status: ideas.status,
      visibility: ideas.visibility,
      updatedAt: ideas.updatedAt,
      createdAt: ideas.createdAt,
      timeline: ideaDetails.timeline,
      spaceType: ideaDetails.spaceType,
      problem: ideaDetails.problem,
      targetAudience: ideaDetails.targetAudience,
      metadata: ideaDetails.metadata,
    })
    .from(ideas)
    .leftJoin(ideaDetails, eq(ideaDetails.ideaId, ideas.id))
    .where(eq(ideas.ownerId, ownerId))
    .orderBy(desc(ideas.updatedAt));

  const ideaIds = ideaRows.map((idea) => idea.id);

  const [reactionCounts, commentCounts] =
    ideaIds.length === 0
      ? [[], []]
      : await Promise.all([
          db
            .select({
              ideaId: ideaReactions.ideaId,
              value: count(),
            })
            .from(ideaReactions)
            .where(inArray(ideaReactions.ideaId, ideaIds))
            .groupBy(ideaReactions.ideaId),
          db
            .select({
              ideaId: ideaComments.ideaId,
              value: count(),
            })
            .from(ideaComments)
            .where(
              and(
                inArray(ideaComments.ideaId, ideaIds),
                eq(ideaComments.status, "visible"),
              ),
            )
            .groupBy(ideaComments.ideaId),
        ]);

  const reactionMap = new Map(reactionCounts.map((item) => [item.ideaId, Number(item.value ?? 0)]));
  const commentMap = new Map(commentCounts.map((item) => [item.ideaId, Number(item.value ?? 0)]));

  const ideasWithTasks: WorkspaceIdea[] = ideaRows.map((idea) => {
    const tasks = enrichTasks({
      id: idea.id,
      slug: idea.slug,
      title: idea.title,
      status: idea.status,
      visibility: idea.visibility,
      metadata: (idea.metadata as Record<string, unknown> | null) ?? null,
    }).sort(compareTasks);

    return {
      id: idea.id,
      slug: idea.slug,
      title: idea.title,
      summary: idea.summary,
      status: idea.status,
      visibility: idea.visibility,
      updatedAt: idea.updatedAt.toISOString(),
      createdAt: idea.createdAt.toISOString(),
      timeline: idea.timeline,
      spaceType: idea.spaceType,
      problem: idea.problem,
      targetAudience: idea.targetAudience,
      comments: commentMap.get(idea.id) ?? 0,
      likes: reactionMap.get(idea.id) ?? 0,
      tasks,
    };
  });

  const tasks = ideasWithTasks.flatMap((idea) => idea.tasks).sort(compareTasks);

  return {
    ideas: ideasWithTasks,
    tasks,
    stats: {
      totalIdeas: ideasWithTasks.length,
      publicIdeas: ideasWithTasks.filter((idea) => idea.visibility === "public").length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.status === "completed").length,
      sharedTasks: tasks.filter((task) => task.status === "shared").length,
      dueSoonTasks: tasks.filter((task) => isDueSoon(task.deadline)).length,
    },
  };
}
