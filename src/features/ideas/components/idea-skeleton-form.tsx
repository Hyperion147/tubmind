"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { z } from "zod/v4";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UpdateIdeaInput } from "@/lib/validators/idea";

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

const skeletonFormSchema = z.object({
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

type SkeletonFormValues = z.input<typeof skeletonFormSchema>;

type IdeaSkeletonFormProps = {
  ideaId: string;
  initialValues: SkeletonFormValues;
};

export function IdeaSkeletonForm({ ideaId, initialValues }: IdeaSkeletonFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<SkeletonFormValues>({
    resolver: zodResolver(skeletonFormSchema as never),
    defaultValues: initialValues,
  });
  const allowComments = useWatch({ control: form.control, name: "allowComments" });
  const watchedFeatures = useWatch({ control: form.control, name: "features" });
  const watchedTechStacks = useWatch({ control: form.control, name: "techStacks" });
  const [activeFeatureItem, setActiveFeatureItem] = useState<string>(
    initialValues.features?.length ? "feature-0" : ""
  );
  const [activeTechItem, setActiveTechItem] = useState<string>(
    initialValues.techStacks?.length ? "tech-0" : ""
  );

  const featuresFieldArray = useFieldArray({
    control: form.control,
    name: "features",
  });
  const techStacksFieldArray = useFieldArray({
    control: form.control,
    name: "techStacks",
  });

  const mutation = useMutation<unknown, Error, UpdateIdeaInput>({
    mutationFn: async (values) => {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to update idea");
      }

      return payload.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ideas", "mine"] });
      router.refresh();
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      title: values.title,
      summary: values.summary,
      description: values.description,
      progressNotes: values.progressNotes,
      status: values.status,
      visibility: values.visibility,
      allowComments: values.allowComments,
      details: {
        problem: values.problem,
        targetAudience: values.targetAudience,
        designStyle: values.designStyle,
        budgetRange: values.budgetRange,
        timeline: values.timeline,
        spaceType: values.spaceType,
      },
      features: (values.features ?? []).map((feature, index) => ({
        label: feature.label,
        description: feature.description,
        isCompleted: feature.isCompleted ?? false,
        sortOrder: index,
      })),
      techStacks: (values.techStacks ?? []).map((tech, index) => ({
        name: tech.name,
        category: tech.category,
        notes: tech.notes,
        sortOrder: index,
      })),
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-2">
          <label
            htmlFor="title"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Idea title
          </label>
          <Input
            id="title"
            {...form.register("title")}
            className="h-12 bg-background/70"
            placeholder="Voice notes for creators who get their best ideas in the shower"
          />
          {form.formState.errors.title ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </label>
            <Select
              defaultValue={initialValues.status}
              onValueChange={(value) =>
                form.setValue("status", value as SkeletonFormValues["status"])
              }
            >
              <SelectTrigger className="h-12 bg-background/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="needs_revision">Needs revision</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Visibility
            </label>
            <Select
              defaultValue={initialValues.visibility}
              onValueChange={(value) =>
                form.setValue("visibility", value as SkeletonFormValues["visibility"])
              }
            >
              <SelectTrigger className="h-12 bg-background/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <label
            htmlFor="summary"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Summary
          </label>
          <Textarea
            id="summary"
            {...form.register("summary")}
            className="min-h-24 bg-background/70"
            placeholder="A tight overview for cards and listings."
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="progressNotes"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Progress notes
          </label>
          <Textarea
            id="progressNotes"
            {...form.register("progressNotes")}
            className="min-h-24 bg-background/70"
            placeholder="What changed, what is blocked, what comes next."
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="description"
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          Full description
        </label>
        <Textarea
          id="description"
          {...form.register("description")}
          className="min-h-32 bg-background/70"
          placeholder="Describe the idea, why it matters, what shape it could take, and why it should exist."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InputField id="spaceType" label="Space type" register={form.register("spaceType")} />
        <InputField
          id="designStyle"
          label="Design style"
          register={form.register("designStyle")}
        />
        <InputField
          id="budgetRange"
          label="Budget range"
          register={form.register("budgetRange")}
        />
        <InputField id="timeline" label="Timeline" register={form.register("timeline")} />
        <InputField
          id="targetAudience"
          label="Target audience"
          register={form.register("targetAudience")}
        />
        <label className="flex items-center gap-3 border border-border bg-secondary/50 px-4 py-3 text-sm text-secondary-foreground">
          <Checkbox
            checked={allowComments}
            onCheckedChange={(checked) => form.setValue("allowComments", checked === true)}
            className="rounded-none"
          />
          Allow logged-in users to comment
        </label>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="problem"
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          Problem / goal
        </label>
        <Textarea
          id="problem"
          {...form.register("problem")}
          className="min-h-28 bg-background/70"
          placeholder="What problem does this idea solve?"
        />
      </div>

      <section className="grid gap-4">
        <FieldArrayCard
          title="Features"
          description="Add the practical pieces or experience details this idea should include."
          count={featuresFieldArray.fields.length}
          actionLabel="Add feature"
          onAdd={() => {
            featuresFieldArray.append({
              label: "",
              description: "",
              isCompleted: false,
            });
            setActiveFeatureItem(`feature-${featuresFieldArray.fields.length}`);
          }}
        >
          {featuresFieldArray.fields.length === 0 ? (
            <EmptyStateText text="No features yet. Add the pieces that make the concept feel complete." />
          ) : (
            <div className="grid gap-3">
              <Accordion
                type="single"
                collapsible
                value={activeFeatureItem}
                onValueChange={setActiveFeatureItem}
                className="gap-2"
              >
                {featuresFieldArray.fields.map((field, index) => (
                  <AccordionItem
                    key={field.id}
                    value={`feature-${index}`}
                    className="mb-2 bg-background/60 px-3 shadow-sm ring-1 ring-border/35 last:mb-0"
                  >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-4">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                Feature {String(index + 1).padStart(2, "0")}
                              </Badge>
                              {form.getValues(`features.${index}.isCompleted`) ? (
                                <Badge variant="secondary" className="font-mono">
                                  planned
                                </Badge>
                              ) : null}
                            </div>
                            <p className="truncate text-sm font-medium text-foreground">
                              {watchedFeatures?.[index]?.label || "Untitled feature"}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              Edit feature
                            </p>
                            <FieldArrayControls
                              canMoveUp={index > 0}
                              canMoveDown={index < featuresFieldArray.fields.length - 1}
                              onMoveUp={() => {
                                featuresFieldArray.swap(index, index - 1);
                                setActiveFeatureItem(`feature-${index - 1}`);
                              }}
                              onMoveDown={() => {
                                featuresFieldArray.swap(index, index + 1);
                                setActiveFeatureItem(`feature-${index + 1}`);
                              }}
                              onRemove={() => {
                                featuresFieldArray.remove(index);
                                setActiveFeatureItem(
                                  featuresFieldArray.fields.length > 1
                                    ? `feature-${Math.max(0, index - 1)}`
                                    : ""
                                );
                              }}
                            />
                          </div>

                          <Input
                            {...form.register(`features.${index}.label`)}
                            className="h-12 bg-card"
                            placeholder="Backlit mirror wall"
                          />
                          <Textarea
                            {...form.register(`features.${index}.description`)}
                            className="min-h-24 bg-card"
                            placeholder="Short note about why this feature matters."
                          />
                          <label className="flex items-center gap-3 bg-secondary/30 px-4 py-3 text-sm text-secondary-foreground">
                            <Checkbox
                              checked={form.getValues(`features.${index}.isCompleted`)}
                              onCheckedChange={(checked) =>
                                form.setValue(
                                  `features.${index}.isCompleted`,
                                  checked === true
                                )
                              }
                              className="rounded-none"
                            />
                            Mark as already resolved / planned
                          </label>
                        </div>
                      </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </FieldArrayCard>

        <FieldArrayCard
          title="Tech stack"
          description="Track the tools, integrations, or build systems attached to this idea."
          count={techStacksFieldArray.fields.length}
          actionLabel="Add stack item"
          onAdd={() => {
            techStacksFieldArray.append({
              name: "",
              category: "",
              notes: "",
            });
            setActiveTechItem(`tech-${techStacksFieldArray.fields.length}`);
          }}
        >
          {techStacksFieldArray.fields.length === 0 ? (
            <EmptyStateText text="No stack items yet. Add the systems behind the concept." />
          ) : (
            <div className="grid gap-3">
              <Accordion
                type="single"
                collapsible
                value={activeTechItem}
                onValueChange={setActiveTechItem}
                className="gap-2"
              >
                {techStacksFieldArray.fields.map((field, index) => (
                  <AccordionItem
                    key={field.id}
                    value={`tech-${index}`}
                    className="mb-2 bg-background/60 px-3 shadow-sm ring-1 ring-border/35 last:mb-0"
                  >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-4">
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                Stack {String(index + 1).padStart(2, "0")}
                              </Badge>
                              {watchedTechStacks?.[index]?.category ? (
                                <Badge variant="secondary" className="font-mono">
                                  {watchedTechStacks[index]?.category}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="truncate text-sm font-medium text-foreground">
                              {watchedTechStacks?.[index]?.name || "Untitled stack item"}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              Edit stack item
                            </p>
                            <FieldArrayControls
                              canMoveUp={index > 0}
                              canMoveDown={index < techStacksFieldArray.fields.length - 1}
                              onMoveUp={() => {
                                techStacksFieldArray.swap(index, index - 1);
                                setActiveTechItem(`tech-${index - 1}`);
                              }}
                              onMoveDown={() => {
                                techStacksFieldArray.swap(index, index + 1);
                                setActiveTechItem(`tech-${index + 1}`);
                              }}
                              onRemove={() => {
                                techStacksFieldArray.remove(index);
                                setActiveTechItem(
                                  techStacksFieldArray.fields.length > 1
                                    ? `tech-${Math.max(0, index - 1)}`
                                    : ""
                                );
                              }}
                            />
                          </div>

                          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                            <Input
                              {...form.register(`techStacks.${index}.name`)}
                              className="h-12 bg-card"
                              placeholder="Supabase"
                            />
                            <Input
                              {...form.register(`techStacks.${index}.category`)}
                              className="h-12 bg-card"
                              placeholder="Backend"
                            />
                          </div>
                          <Textarea
                            {...form.register(`techStacks.${index}.notes`)}
                            className="min-h-24 bg-card"
                            placeholder="Why this tool belongs in the idea."
                          />
                        </div>
                      </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </FieldArrayCard>
      </section>

      {mutation.error ? (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      ) : null}

      {mutation.isSuccess ? (
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Idea skeleton saved.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={mutation.isPending}
        className="h-12 justify-between"
      >
        {mutation.isPending ? "Saving skeleton..." : "Save idea skeleton"}
        <Save className="size-4" />
      </Button>
    </form>
  );
}

function InputField({
  id,
  label,
  register,
}: {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
      >
        {label}
      </label>
      <Input id={id} {...register} className="h-12 bg-background/70" />
    </div>
  );
}

function FieldArrayCard({
  title,
  description,
  count,
  actionLabel,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  count: number;
  actionLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 bg-card/82 p-5 shadow-sm ring-1 ring-border/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {count} items
          </Badge>
          <Button type="button" variant="outline" onClick={onAdd} className="gap-2">
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        </div>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function FieldArrayControls({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <IconButton
        label="Move up"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        icon={ArrowUp}
      />
      <IconButton
        label="Move down"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        icon={ArrowDown}
      />
      <IconButton label="Remove" onClick={onRemove} icon={Trash2} tone="danger" />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: typeof Plus;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex size-10 items-center justify-center border border-border bg-card text-foreground transition-colors duration-300 hover:border-primary hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger" && "hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function EmptyStateText({ text }: { text: string }) {
  return (
    <div className="bg-background/50 p-6 text-sm text-muted-foreground ring-1 ring-dashed ring-border/35">
      {text}
    </div>
  );
}
