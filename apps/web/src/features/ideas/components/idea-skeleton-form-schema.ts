import { z } from "zod/v4";

const featureSchema = z.object({
  label: z.string().trim().min(1).max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isCompleted: z.boolean().default(false),
});

const techStackSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const skeletonFormSchema = z.object({
  title: z.string().trim().min(3).max(180),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  progressNotes: z.string().trim().max(3000).optional().or(z.literal("")),
  status: z.enum([
    "draft",
    "in_progress",
    "submitted",
    "published",
    "needs_revision",
    "archived",
  ]),
  visibility: z.enum(["private", "public"]),
  allowComments: z.boolean(),
  problem: z.string().trim().max(2000).optional().or(z.literal("")),
  targetAudience: z.string().trim().max(1000).optional().or(z.literal("")),
  designStyle: z.string().trim().max(80).optional().or(z.literal("")),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  timeline: z.string().trim().max(80).optional().or(z.literal("")),
  spaceType: z.string().trim().max(80).optional().or(z.literal("")),
  features: z.array(featureSchema).default([]),
  techStacks: z.array(techStackSchema).default([]),
});

export type SkeletonFormValues = z.input<typeof skeletonFormSchema>;
