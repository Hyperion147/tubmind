"use client";

import { Loader2, MessageSquareOff, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  AdminCommentAction,
  AdminCommentResult,
} from "@tubmind/contracts/moderation";
import type { CommentStatus } from "@tubmind/contracts/comment";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useModerateComment } from "@/features/admin/api/use-moderation";

type AdminCommentModerationPanelProps = {
  commentId: string;
  currentStatus: CommentStatus;
  onModerated?: (result: AdminCommentResult) => void;
};

export function AdminCommentModerationPanel({
  commentId,
  currentStatus,
  onModerated,
}: AdminCommentModerationPanelProps) {
  const router = useRouter();
  const [action, setAction] = useState<AdminCommentAction>("hide");
  const [note, setNote] = useState("");
  const mutation = useModerateComment(commentId, (result) => {
    setNote("");
    onModerated?.(result);
    router.refresh();
  });

  const availableActions = useMemo(() => {
    const actions: Array<{ value: AdminCommentAction; label: string }> = [];

    if (currentStatus === "visible") {
      actions.push({ value: "hide", label: "Hide comment" });
      actions.push({ value: "delete", label: "Delete comment" });
    }

    if (currentStatus === "hidden") {
      actions.push({ value: "restore", label: "Restore comment" });
      actions.push({ value: "delete", label: "Delete comment" });
    }

    if (currentStatus === "deleted") {
      actions.push({ value: "restore", label: "Restore to visible" });
    }

    return actions;
  }, [currentStatus]);

  const selectedAction = availableActions.some((item) => item.value === action)
    ? action
    : availableActions[0]?.value;

  async function applyAction() {
    const confirmationCopy: Partial<Record<AdminCommentAction, string>> = {
      delete: "Delete this comment from the discussion feed?",
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
          Comment actions
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {currentStatus}
        </p>
      </div>

      <Select
        value={selectedAction}
        onValueChange={(value) => setAction(value as AdminCommentAction)}
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
        placeholder="Optional moderation note for internal tracking."
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
        {mutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MessageSquareOff className="size-4" />
        )}
      </Button>
    </div>
  );
}
