"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, MessageSquareOff, Shield } from "lucide-react";
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

type CommentStatus = "visible" | "hidden" | "deleted";
type CommentAdminAction = "hide" | "restore" | "delete";

type AdminCommentModerationPanelProps = {
  commentId: string;
  currentStatus: CommentStatus;
  onModerated?: (result: {
    comment: {
      id: string;
      status: CommentStatus;
    };
    log: {
      id: string;
      action: string;
      note: string | null;
      createdAtLabel: string;
      label: string;
    } | null;
  }) => void;
};

export function AdminCommentModerationPanel({
  commentId,
  currentStatus,
  onModerated,
}: AdminCommentModerationPanelProps) {
  const [action, setAction] = useState<CommentAdminAction>("hide");
  const [note, setNote] = useState("");

  const availableActions = useMemo(() => {
    const actions: Array<{ value: CommentAdminAction; label: string }> = [];

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

  const mutation = useMutation({
    mutationFn: async () => {
      const confirmationCopy: Partial<Record<CommentAdminAction, string>> = {
        delete: "Delete this comment from the discussion feed?",
      };

      const confirmation = selectedAction ? confirmationCopy[selectedAction] : null;

      if (confirmation && !window.confirm(confirmation)) {
        return null;
      }

      const response = await fetch(`/api/admin/comments/${commentId}/moderate`, {
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
        throw new Error(payload?.error?.message ?? "Failed to moderate comment");
      }

      return payload.data as {
        comment: {
          id: string;
          status: CommentStatus;
        };
        log: {
          id: string;
          action: string;
          note: string | null;
          createdAtLabel: string;
          label: string;
        } | null;
      };
    },
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      setNote("");
      onModerated?.(result);
    },
  });

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
        onValueChange={(value) => setAction(value as CommentAdminAction)}
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
        onClick={() => mutation.mutate()}
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
