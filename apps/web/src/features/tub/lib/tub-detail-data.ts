import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  ideaComments,
  ideaDetails,
  ideaFeatures,
  ideas,
  ideaTechStacks,
} from "@/db/schema";
import { normalizeIdeaTubData } from "@/lib/tub";

export async function getTubDetailData(input: {
  ideaId: string;
  viewerId: string;
  isAdmin: boolean;
}) {
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, input.ideaId)).limit(1);

  if (!idea) {
    return null;
  }

  const canAccess = input.isAdmin || idea.ownerId === input.viewerId;

  if (!canAccess) {
    return null;
  }

  const [details, features, techStacks, comments] = await Promise.all([
    db.select().from(ideaDetails).where(eq(ideaDetails.ideaId, input.ideaId)).limit(1),
    db.select().from(ideaFeatures).where(eq(ideaFeatures.ideaId, input.ideaId)),
    db.select().from(ideaTechStacks).where(eq(ideaTechStacks.ideaId, input.ideaId)),
    db
      .select()
      .from(ideaComments)
      .where(and(eq(ideaComments.ideaId, input.ideaId), eq(ideaComments.status, "visible"))),
  ]);

  const detail = details[0] ?? null;

  return {
    idea,
    detail,
    features,
    techStacks,
    comments,
    tubData: normalizeIdeaTubData(
      (detail?.metadata as Record<string, unknown> | null | undefined)?.tub,
    ),
  };
}
