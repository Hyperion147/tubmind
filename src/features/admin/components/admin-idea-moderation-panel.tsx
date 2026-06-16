"use client";

import { Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AdminIdeaModerationPanelProps = {
  ideaId: string;
  currentVisibility: "private" | "public";
  currentStatus:
    | "draft"
    | "in_progress"
    | "submitted"
    | "published"
    | "needs_revision"
    | "archived";
  onModerated?: (result: {
    idea:
      | {
          id: string;
          visibility: "private" | "public";
          status:
            | "draft"
            | "in_progress"
            | "submitted"
            | "published"
            | "needs_revision"
            | "archived";
        }
      | null;
    deleted: boolean;
    log: {
      id: string;
      action: string;
      note: string | null;
      createdAtLabel: string;
      label: string;
    } | null;
  }) => void;
};

type AdminAction = "make_public" | "make_private" | "request_revision" | "archive" | "delete";

export function AdminIdeaModerationPanel({
  ideaId,
  currentVisibility,
  currentStatus,
  onModerated,
}: AdminIdeaModerationPanelProps) {
  const router = useRouter();
  const [action, setAction] = useState<AdminAction>("make_public");
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableActions = useMemo(() => {
    const actions: Array<{ value: AdminAction; label: string }> = [];

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
    const confirmationCopy: Partial<Record<AdminAction, string>> = {
      make_private: "Move this idea back to private and remove it from the public listings?",
      request_revision: "Request revision and pull this idea out of public view?",
      archive: "Archive this idea and remove it from the active moderation queue?",
      delete: "Delete this idea permanently? This cannot be undone.",
    };
    const confirmation = selectedAction ? confirmationCopy[selectedAction] : null;

    if (confirmation && !window.confirm(confirmation)) {
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/ideas/${ideaId}/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: selectedAction,
          note,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to moderate idea");
      }

      const result = payload.data as {
        idea: {
          id: string;
          visibility: "private" | "public";
          status:
            | "draft"
            | "in_progress"
            | "submitted"
            | "published"
            | "needs_revision"
            | "archived";
        } | null;
        deleted: boolean;
        log: {
          id: string;
          action: string;
          note: string | null;
          createdAtLabel: string;
          label: string;
        } | null;
      };

      setNote("");
      onModerated?.(result);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to moderate idea");
    } finally {
      setIsPending(false);
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
        onValueChange={(value) => setAction(value as AdminAction)}
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

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <Button
        type="button"
        onClick={applyAction}
        disabled={isPending || availableActions.length === 0}
        className="justify-between"
      >
        {isPending ? "Applying action..." : "Apply action"}
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
      </Button>
    </div>
  );
}
