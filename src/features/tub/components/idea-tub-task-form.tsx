"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ImagePlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tubTaskStatuses, type TubTaskStatus } from "@/lib/tub";

import { statusMeta, type IdeaTubPageProps, type TaskDraft } from "./idea-tub-types";
import { formatDateLabel, parseDateValue, toDateValue } from "./idea-tub-utils";

type IdeaTubTaskFormProps = {
  addTask: () => void;
  draft: TaskDraft;
  errorMessage: string | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  ideaId: IdeaTubPageProps["idea"]["id"];
  isDeadlinePickerOpen: boolean;
  mutationError: string | undefined;
  mutationSuccess: boolean;
  selectedDate: string | null;
  setDraft: React.Dispatch<React.SetStateAction<TaskDraft>>;
  setIsDeadlinePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function IdeaTubTaskForm({
  addTask,
  draft,
  errorMessage,
  handleImageChange,
  ideaId,
  isDeadlinePickerOpen,
  mutationError,
  mutationSuccess,
  selectedDate,
  setDraft,
  setIsDeadlinePickerOpen,
}: IdeaTubTaskFormProps) {
  return (
    <Card className="border-border bg-secondary shadow-xl backdrop-blur-2xl">
      <CardHeader className="gap-2 p-5 md:p-6">
        <Badge variant="outline" className="w-fit font-mono">
          New task
        </Badge>
        <CardTitle className="text-xl">
          {selectedDate ? formatDateLabel(selectedDate) : "Select a date"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 pt-0 md:p-6 md:pt-0">
        <Input
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder="Title"
          className="h-12 bg-background/75"
        />
        <Textarea
          value={draft.description}
          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          placeholder="Description or note"
          className="min-h-28 bg-background/75"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Popover open={isDeadlinePickerOpen} onOpenChange={setIsDeadlinePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={!selectedDate}
                className="h-12 justify-between bg-background/75 font-normal"
              >
                <span className={cn(!draft.deadline && "text-muted-foreground")}>
                  {draft.deadline ? formatDateLabel(draft.deadline) : "Deadline"}
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto px-5" align="start">
              <Calendar
                mode="single"
                selected={draft.deadline ? (parseDateValue(draft.deadline) ?? undefined) : undefined}
                onSelect={(date) => {
                  setDraft((current) => ({
                    ...current,
                    deadline: date ? toDateValue(date) : null,
                  }));
                  setIsDeadlinePickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                status: value as TubTaskStatus,
              }))
            }
          >
            <SelectTrigger disabled={!selectedDate}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tubTaskStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusMeta[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3">
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 border border-dashed border-border bg-background/70 px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <ImagePlus className="size-4" />
            Add one reference image
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          {draft.image ? (
            <div className="overflow-hidden border border-border bg-background/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.image} alt="Task reference" className="h-40 w-full object-cover" />
              <div className="flex items-center justify-between gap-3 p-3">
                <p className="text-sm text-muted-foreground">Reference image attached</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDraft((current) => ({ ...current, image: null }))}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
        {mutationError ? <p className="text-sm text-destructive">{mutationError}</p> : null}
        {mutationSuccess ? (
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Tub saved
          </p>
        ) : null}

        {!selectedDate ? (
          <p className="text-sm text-muted-foreground">Choose a date first.</p>
        ) : null}

        {selectedDate && draft.deadline ? (
          <button
            type="button"
            onClick={() => setDraft((current) => ({ ...current, deadline: null }))}
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Check className="size-4" />
            Clear deadline
          </button>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={addTask} className="gap-2" disabled={!selectedDate}>
            <Plus className="size-4" />
            Add to tub
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/ideas/${ideaId}`} className="gap-2">
              Edit Idea
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
