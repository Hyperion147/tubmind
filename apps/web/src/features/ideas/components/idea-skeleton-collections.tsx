"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";

import { ConfirmDeleteAction } from "@/components/confirm-delete-action";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { SkeletonFormValues } from "./idea-skeleton-form-schema";

type IdeaSkeletonCollectionsProps = {
  activeFeatureItem: string;
  activeTechItem: string;
  featuresFieldArray: UseFieldArrayReturn<SkeletonFormValues, "features", "id">;
  form: UseFormReturn<SkeletonFormValues>;
  setActiveFeatureItem: (value: string) => void;
  setActiveTechItem: (value: string) => void;
  techStacksFieldArray: UseFieldArrayReturn<SkeletonFormValues, "techStacks", "id">;
  watchedFeatures?: SkeletonFormValues["features"];
  watchedTechStacks?: SkeletonFormValues["techStacks"];
};

export function IdeaSkeletonCollections({
  activeFeatureItem,
  activeTechItem,
  featuresFieldArray,
  form,
  setActiveFeatureItem,
  setActiveTechItem,
  techStacksFieldArray,
  watchedFeatures,
  watchedTechStacks,
}: IdeaSkeletonCollectionsProps) {
  return (
    <section className="grid gap-4">
      <FeatureCollection
        activeFeatureItem={activeFeatureItem}
        featuresFieldArray={featuresFieldArray}
        form={form}
        setActiveFeatureItem={setActiveFeatureItem}
        watchedFeatures={watchedFeatures}
      />
      <TechStackCollection
        activeTechItem={activeTechItem}
        form={form}
        setActiveTechItem={setActiveTechItem}
        techStacksFieldArray={techStacksFieldArray}
        watchedTechStacks={watchedTechStacks}
      />
    </section>
  );
}

function FeatureCollection({
  activeFeatureItem,
  featuresFieldArray,
  form,
  setActiveFeatureItem,
  watchedFeatures,
}: {
  activeFeatureItem: string;
  featuresFieldArray: UseFieldArrayReturn<SkeletonFormValues, "features", "id">;
  form: UseFormReturn<SkeletonFormValues>;
  setActiveFeatureItem: (value: string) => void;
  watchedFeatures?: SkeletonFormValues["features"];
}) {
  return (
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
                            : "",
                        );
                        toast.success("Feature removed");
                      }}
                      removeDescription="This removes the feature from the idea form. Save the idea skeleton to persist the change."
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
                          checked === true,
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
      )}
    </FieldArrayCard>
  );
}

function TechStackCollection({
  activeTechItem,
  form,
  setActiveTechItem,
  techStacksFieldArray,
  watchedTechStacks,
}: {
  activeTechItem: string;
  form: UseFormReturn<SkeletonFormValues>;
  setActiveTechItem: (value: string) => void;
  techStacksFieldArray: UseFieldArrayReturn<SkeletonFormValues, "techStacks", "id">;
  watchedTechStacks?: SkeletonFormValues["techStacks"];
}) {
  return (
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
                            : "",
                        );
                        toast.success("Stack item removed");
                      }}
                      removeDescription="This removes the stack item from the idea form. Save the idea skeleton to persist the change."
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
      )}
    </FieldArrayCard>
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
  removeDescription,
}: {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  removeDescription: string;
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
      <ConfirmDeleteAction
        title="Remove this item?"
        description={removeDescription}
        actionLabel="Remove item"
        size="icon-lg"
        variant="ghost"
        onConfirm={onRemove}
        triggerAriaLabel="Remove"
        triggerClassName="flex size-10 items-center justify-center rounded-none border border-border bg-card text-foreground transition-colors duration-300 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </ConfirmDeleteAction>
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
        tone === "danger" && "hover:border-destructive hover:bg-destructive/10 hover:text-destructive",
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
