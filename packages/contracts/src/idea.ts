import { z } from "zod/v4";

export const ideaStatusSchema = z.enum([
  "draft",
  "in_progress",
  "submitted",
  "published",
  "needs_revision",
  "archived",
]);

export const ideaVisibilitySchema = z.enum(["private", "public", "hidden"]);

export const ideaFeatureSchema = z.object({
  label: z.string().trim().min(1).max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isCompleted: z.boolean().default(false),
});

export const ideaTechStackSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const ideaDetailsSchema = z.object({
  problem: z.string().trim().max(2000).optional().or(z.literal("")),
  targetAudience: z.string().trim().max(1000).optional().or(z.literal("")),
  designStyle: z.string().trim().max(80).optional().or(z.literal("")),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  timeline: z.string().trim().max(80).optional().or(z.literal("")),
  spaceType: z.string().trim().max(80).optional().or(z.literal("")),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createIdeaSchema = z.object({
  title: z.string().trim().min(3).max(180),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  progressNotes: z.string().trim().max(3000).optional().or(z.literal("")),
  status: ideaStatusSchema.default("draft"),
  visibility: z.enum(["private", "public"]).default("private"),
  allowComments: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  details: ideaDetailsSchema.optional(),
  features: z.array(ideaFeatureSchema).default([]),
  techStacks: z.array(ideaTechStackSchema).default([]),
});

export const updateIdeaSchema = createIdeaSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided"
);

export type CreateIdeaFormValues = z.input<typeof createIdeaSchema>;
export type CreateIdeaInput = z.output<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.output<typeof updateIdeaSchema>;
export type IdeaStatus = z.infer<typeof ideaStatusSchema>;
export type IdeaVisibility = z.infer<typeof ideaVisibilitySchema>;

export const ideaMutationResultSchema = z.object({
  id: z.string(),
  slug: z.string(),
  status: ideaStatusSchema,
  visibility: ideaVisibilitySchema,
  updatedAt: z.string(),
});

export const deleteIdeaResultSchema = z.object({
  deleted: z.literal(true),
  id: z.string(),
});

export type IdeaMutationResult = z.infer<typeof ideaMutationResultSchema>;
export type DeleteIdeaResult = z.infer<typeof deleteIdeaResultSchema>;

const nullableDateStringSchema = z.string().nullable();

export const myIdeaSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  status: ideaStatusSchema,
  visibility: ideaVisibilitySchema,
  allowComments: z.boolean(),
  lastActivityAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicIdeaSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  status: ideaStatusSchema,
  visibility: ideaVisibilitySchema,
  isFeatured: z.boolean(),
  publishedAt: nullableDateStringSchema,
  ownerId: z.string(),
  ownerName: z.string(),
  ownerAvatarUrl: z.string().nullable(),
});

export const ideaDetailResultSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  description: z.string().nullable(),
  progressNotes: z.string().nullable(),
  status: ideaStatusSchema,
  visibility: ideaVisibilitySchema,
  allowComments: z.boolean(),
  isFeatured: z.boolean(),
  publishedAt: nullableDateStringSchema,
  lastActivityAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  owner: z
    .object({
      displayName: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
  details: z
    .object({
      problem: z.string().nullable(),
      targetAudience: z.string().nullable(),
      designStyle: z.string().nullable(),
      budgetRange: z.string().nullable(),
      timeline: z.string().nullable(),
      spaceType: z.string().nullable(),
    })
    .nullable(),
  features: z.array(
    z.object({
      id: z.string(),
      ideaId: z.string(),
      label: z.string(),
      description: z.string().nullable(),
      sortOrder: z.number().int(),
      isCompleted: z.boolean(),
      createdAt: z.string(),
    }),
  ),
  techStacks: z.array(
    z.object({
      id: z.string(),
      ideaId: z.string(),
      name: z.string(),
      category: z.string().nullable(),
      notes: z.string().nullable(),
      sortOrder: z.number().int(),
    }),
  ),
  comments: z.array(
    z.object({
      id: z.string(),
      body: z.string(),
      status: z.enum(["visible", "hidden", "deleted"]),
      parentCommentId: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      authorId: z.string(),
      authorName: z.string(),
      authorAvatarUrl: z.string().nullable(),
    }),
  ),
});

export type MyIdeaSummary = z.infer<typeof myIdeaSummarySchema>;
export type PublicIdeaSummary = z.infer<typeof publicIdeaSummarySchema>;
export type IdeaDetailResult = z.infer<typeof ideaDetailResultSchema>;
