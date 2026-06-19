"use client";

import { Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  AdminIdeaAction,
  AdminIdeaResult,
  IdeaStatus,
  IdeaVisibility,
} from "@tubmind/contracts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useModerateIdea } from "@/features/admin/api/use-moderation";

type AdminIdeaModerationPanelProps = {
  ideaId: string;
  currentVisibility: IdeaVisibility;
  currentStatus: IdeaStatus;
  onModerated?: (result: AdminIdeaResult) => void;
};

export function AdminIdeaModerationPanel({
  ideaId,
  currentVisibility,
  currentStatus,
  onModerated,
}: AdminIdeaModerationPanelProps) {
  const router = useRouter();
  const [action, setAction] = useState<AdminIdeaAction>("make_public");
  const [note, setNote] = useState("");
  const mutation = useModerateIdea(ideaId, (result) => {
    setNote("");
    onModerated?.(result);
    router.refresh();
  });

  const availableActions = useMemo(() => {
    const actions: Array<{ value: AdminIdeaAction; label: string }> = [];

    if (currentVisibility !== "public") {
      actions.push({ value: "make_public", label: "Make public" });
    }

    if (currentVisibility !== "private") {
      actions.push({ value: "make_private", label: "Make private" });
    }

    if (currentStatus !== "needs_revision") {
      actions.push({ value: "request_revision", label: "Request revision" });
    }

    if (currentStatus !== "archived") {
      actions.push({ value: "archive", label: "Archive idea" });
    }

    actions.push({ value: "delete", label: "Delete idea" });

    return actions;
  }, [currentStatus, currentVisibility]);

  const selectedAction = availableActions.some((item) => item.value === action)
    ? action
    : availableActions[0]?.value;

  async function applyAction() {
    const confirmationCopy: Partial<Record<AdminIdeaAction, string>> = {
      make_private: "Move this idea back to private and remove it from the public listings?",
      request_revision: "Request revision and pull this idea out of public view?",
      archive: "Archive this idea and remove it from the active moderation queue?",
      delete: "Delete this idea permanently? This cannot be undone.",
    };
    const confirmation = selectedAction ? confirmationCopy[selectedAction] : null;

    if (confirmation && !window.confirm(confirmation)) {
      return;
    }

    try {
      if (selectedAction) {
        await mutation.mutateAsync({ action: selectedAction, note });
      }
    } catch {
      // Error state is exposed by the mutation.
    }
  }

  return (
    <div className="grid gap-3 bg-background/55 p-4 ring-1 ring-border/35">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Shield className="size-4 text-muted-foreground" />
          Moderation actions
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {currentVisibility} / {currentStatus}
        </p>
      </div>

      <Select
        value={selectedAction}
        onValueChange={(value) => setAction(value as AdminIdeaAction)}
      >
        <SelectTrigger className="h-11 bg-card/80">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableActions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional moderation note for internal tracking or revision context."
        className="min-h-24 bg-card/80"
      />

      {mutation.error ? (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      ) : null}

      <Button
        type="button"
        onClick={applyAction}
        disabled={mutation.isPending || availableActions.length === 0}
        className="justify-between"
      >
        {mutation.isPending ? "Applying action..." : "Apply action"}
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
      </Button>
    </div>
  );
}
