import "server-only";

import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { ideaReactions, ideas, profiles } from "@/db/schema";
import type { ListingCardData } from "@/features/listing/card/listing-card";

export const LISTINGS_PAGE_SIZE = 9;

export async function getListingsPageData(input: {
  query: string;
  page: number;
  viewerId?: string;
}) {
  const offset = (input.page - 1) * LISTINGS_PAGE_SIZE;
  const filters = [
    eq(ideas.visibility, "public"),
    ...(input.query
      ? [
          or(
            ilike(ideas.title, `%${input.query}%`),
            ilike(ideas.summary, `%${input.query}%`),
          )!,
        ]
      : []),
  ];

  let listings: ListingCardData[] = [];
  let totalCount = 0;

  try {
    const [items, total] = await Promise.all([
      db
        .select({
          id: ideas.id,
          title: ideas.title,
          summary: ideas.summary,
          slug: ideas.slug,
          publishedAt: ideas.publishedAt,
          ownerName: profiles.displayName,
        })
        .from(ideas)
        .innerJoin(profiles, eq(ideas.ownerId, profiles.id))
        .where(and(...filters))
        .orderBy(desc(ideas.publishedAt), desc(ideas.updatedAt))
        .limit(LISTINGS_PAGE_SIZE)
        .offset(offset),
      db.select({ value: count() }).from(ideas).where(and(...filters)),
    ]);

    const ideaIds = items.map((item) => item.id);
    const [reactionCounts, viewerReactions] =
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
            input.viewerId
              ? db
                  .select({
                    ideaId: ideaReactions.ideaId,
                  })
                  .from(ideaReactions)
                  .where(
                    and(
                      eq(ideaReactions.userId, input.viewerId),
                      inArray(ideaReactions.ideaId, ideaIds),
                    ),
                  )
              : Promise.resolve([]),
          ]);

    const reactionCountMap = new Map(
      reactionCounts.map((row) => [row.ideaId, row.value]),
    );
    const viewerReactionIds = new Set(
      viewerReactions.map((row) => row.ideaId),
    );

    listings = items.map((item) => ({
      ...item,
      initialReacted: viewerReactionIds.has(item.id),
      reactionCount: reactionCountMap.get(item.id) ?? 0,
    }));
    totalCount = total[0]?.value ?? 0;
  } catch (error) {
    const relationMissing =
      typeof error === "object" &&
      error !== null &&
      "cause" in error &&
      typeof error.cause === "object" &&
      error.cause !== null &&
      "code" in error.cause &&
      error.cause.code === "42P01";

    if (!relationMissing) {
      throw error;
    }
  }

  return {
    listings,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / LISTINGS_PAGE_SIZE)),
  };
}
