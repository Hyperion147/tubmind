import { z } from "zod/v4";

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
  status: z
    .enum(["draft", "in_progress", "submitted", "published", "needs_revision", "archived"])
    .default("draft"),
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
