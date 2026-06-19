import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { ideaComments, ideas, profiles } from "@tubmind/database";

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function getAdminIdeaStats() {
  const [row] = await db
    .select({
      totalIdeas: sql<number>`count(*)`,
      publicIdeas: sql<number>`count(*) filter (where ${ideas.visibility} = 'public')`,
      revisionIdeas: sql<number>`count(*) filter (where ${ideas.status} = 'needs_revision')`,
    })
    .from(ideas);

  return {
    totalIdeas: toNumber(row?.totalIdeas),
    publicIdeas: toNumber(row?.publicIdeas),
    revisionIdeas: toNumber(row?.revisionIdeas),
  };
}

export async function getAdminUserStats() {
  const [row] = await db
    .select({
      totalUsers: sql<number>`count(*)`,
      blockedUsers: sql<number>`count(*) filter (where ${profiles.status} = 'blocked')`,
      reviewUsers: sql<number>`count(*) filter (where ${profiles.status} = 'under_review')`,
      adminUsers: sql<number>`count(*) filter (where ${profiles.role} = 'admin')`,
    })
    .from(profiles);

  return {
    totalUsers: toNumber(row?.totalUsers),
    blockedUsers: toNumber(row?.blockedUsers),
    reviewUsers: toNumber(row?.reviewUsers),
    adminUsers: toNumber(row?.adminUsers),
  };
}

export async function getAdminCommentStats() {
  const [row] = await db
    .select({
      totalComments: sql<number>`count(*)`,
      hiddenComments: sql<number>`count(*) filter (where ${ideaComments.status} = 'hidden')`,
      deletedComments: sql<number>`count(*) filter (where ${ideaComments.status} = 'deleted')`,
    })
    .from(ideaComments);

  return {
    totalComments: toNumber(row?.totalComments),
    hiddenComments: toNumber(row?.hiddenComments),
    deletedComments: toNumber(row?.deletedComments),
  };
}
