"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IdeaSkeletonCollections } from "@/features/ideas/components/idea-skeleton-collections";
import {
  skeletonFormSchema,
  type SkeletonFormValues,
} from "@/features/ideas/components/idea-skeleton-form-schema";
import { useUpdateIdea } from "@/features/ideas/hooks/use-idea-mutations";

type IdeaSkeletonFormProps = {
  ideaId: string;
  initialValues: SkeletonFormValues;
};

export function IdeaSkeletonForm({ ideaId, initialValues }: IdeaSkeletonFormProps) {
  const router = useRouter();
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

  const mutation = useUpdateIdea(ideaId, {
    onSuccess: () => {
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

      <IdeaSkeletonCollections
        activeFeatureItem={activeFeatureItem}
        activeTechItem={activeTechItem}
        featuresFieldArray={featuresFieldArray}
        form={form}
        setActiveFeatureItem={setActiveFeatureItem}
        setActiveTechItem={setActiveTechItem}
        techStacksFieldArray={techStacksFieldArray}
        watchedFeatures={watchedFeatures}
        watchedTechStacks={watchedTechStacks}
      />

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

