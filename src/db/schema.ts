import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const auth = pgSchema("auth");

export const authUsers = auth.table("users", {
  id: uuid("id").primaryKey(),
});

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", [
  "active",
  "under_review",
  "blocked",
  "deleted",
]);
export const ideaStatusEnum = pgEnum("idea_status", [
  "draft",
  "in_progress",
  "submitted",
  "published",
  "needs_revision",
  "archived",
]);
export const ideaVisibilityEnum = pgEnum("idea_visibility", [
  "private",
  "public",
  "hidden",
]);
export const commentStatusEnum = pgEnum("comment_status", [
  "visible",
  "hidden",
  "deleted",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
]);
export const reportTargetEnum = pgEnum("report_target", [
  "idea",
  "comment",
  "user",
]);
export const moderationActionEnum = pgEnum("moderation_action", [
  "publish",
  "hide",
  "request_revision",
  "delete_idea",
  "block_user",
  "unblock_user",
  "delete_comment",
  "dismiss_report",
]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull().unique(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    role: userRoleEnum("role").notNull().default("user"),
    status: userStatusEnum("status").notNull().default("active"),
    isOnboarded: boolean("is_onboarded").notNull().default(false),
    blockedReason: text("blocked_reason"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("profiles_role_idx").on(table.role),
    index("profiles_status_idx").on(table.status),
    index("profiles_created_at_idx").on(table.createdAt),
  ]
);

export const ideas = pgTable(
  "ideas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    title: varchar("title", { length: 180 }).notNull(),
    summary: text("summary"),
    description: text("description"),
    progressNotes: text("progress_notes"),
    status: ideaStatusEnum("status").notNull().default("draft"),
    visibility: ideaVisibilityEnum("visibility").notNull().default("private"),
    isFeatured: boolean("is_featured").notNull().default(false),
    allowComments: boolean("allow_comments").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("ideas_owner_idx").on(table.ownerId),
    index("ideas_status_idx").on(table.status),
    index("ideas_visibility_idx").on(table.visibility),
    index("ideas_updated_at_idx").on(table.updatedAt),
    index("ideas_visibility_updated_at_idx").on(table.visibility, table.updatedAt),
    index("ideas_status_updated_at_idx").on(table.status, table.updatedAt),
    index("ideas_published_at_idx").on(table.publishedAt),
  ]
);

export const ideaDetails = pgTable("idea_details", {
  ideaId: uuid("idea_id")
    .primaryKey()
    .references(() => ideas.id, { onDelete: "cascade" }),
  problem: text("problem"),
  targetAudience: text("target_audience"),
  designStyle: varchar("design_style", { length: 80 }),
  budgetRange: varchar("budget_range", { length: 80 }),
  timeline: varchar("timeline", { length: 80 }),
  spaceType: varchar("space_type", { length: 80 }),
  properties: jsonb("properties").$type<Record<string, string | number | boolean | null>>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const ideaFeatures = pgTable(
  "idea_features",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 140 }).notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isCompleted: boolean("is_completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idea_features_idea_idx").on(table.ideaId)]
);

export const ideaTechStacks = pgTable(
  "idea_tech_stacks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    category: varchar("category", { length: 60 }),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("idea_tech_stacks_idea_idx").on(table.ideaId),
    uniqueIndex("idea_tech_stacks_unique_name_per_idea").on(
      table.ideaId,
      table.name
    ),
  ]
);

export const ideaProgressEntries = pgTable(
  "idea_progress_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 140 }).notNull(),
    note: text("note"),
    percentComplete: integer("percent_complete"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idea_progress_entries_idea_idx").on(table.ideaId)]
);

export const ideaComments = pgTable(
  "idea_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    parentCommentId: uuid("parent_comment_id"),
    body: text("body").notNull(),
    status: commentStatusEnum("status").notNull().default("visible"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idea_comments_idea_idx").on(table.ideaId),
    index("idea_comments_author_idx").on(table.authorId),
    index("idea_comments_status_idx").on(table.status),
    index("idea_comments_updated_at_idx").on(table.updatedAt),
    index("idea_comments_status_updated_at_idx").on(table.status, table.updatedAt),
  ]
);

export const ideaReactions = pgTable(
  "idea_reactions",
  {
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.ideaId, table.userId] }),
    index("idea_reactions_user_idx").on(table.userId),
  ]
);

export const ideaViews = pgTable(
  "idea_views",
  {
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    viewerId: uuid("viewer_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    viewedAt: timestamp("viewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idea_views_idea_idx").on(table.ideaId),
    index("idea_views_viewer_idx").on(table.viewerId),
  ]
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    targetType: reportTargetEnum("target_type").notNull(),
    targetIdeaId: uuid("target_idea_id").references(() => ideas.id, {
      onDelete: "cascade",
    }),
    targetCommentId: uuid("target_comment_id").references(
      () => ideaComments.id,
      { onDelete: "cascade" }
    ),
    targetUserId: uuid("target_user_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    index("reports_status_idx").on(table.status),
    index("reports_target_type_idx").on(table.targetType),
  ]
);

export const moderationLogs = pgTable(
  "moderation_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    action: moderationActionEnum("action").notNull(),
    targetIdeaId: uuid("target_idea_id").references(() => ideas.id, {
      onDelete: "cascade",
    }),
    targetCommentId: uuid("target_comment_id").references(
      () => ideaComments.id,
      { onDelete: "cascade" }
    ),
    targetUserId: uuid("target_user_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    reportId: uuid("report_id").references(() => reports.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("moderation_logs_admin_idx").on(table.adminId),
    index("moderation_logs_action_idx").on(table.action),
    index("moderation_logs_target_idea_idx").on(table.targetIdeaId),
    index("moderation_logs_target_comment_idx").on(table.targetCommentId),
    index("moderation_logs_target_user_idx").on(table.targetUserId),
    index("moderation_logs_created_at_idx").on(table.createdAt),
  ]
);

export const timeLogs = pgTable(
  "time_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    taskId: varchar("task_id", { length: 120 }).notNull(),
    taskTitle: varchar("task_title", { length: 180 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("time_logs_owner_idx").on(table.ownerId),
    index("time_logs_idea_idx").on(table.ideaId),
    index("time_logs_started_at_idx").on(table.startedAt),
  ]
);
