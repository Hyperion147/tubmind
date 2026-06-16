"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Shield, UserRoundCog } from "lucide-react";
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

type UserRole = "user" | "admin";
type UserStatus = "active" | "under_review" | "blocked" | "deleted";

type UserAdminAction =
  | "set_active"
  | "set_under_review"
  | "block"
  | "unblock"
  | "make_admin"
  | "make_user";

type AdminUserModerationPanelProps = {
  userId: string;
  currentRole: UserRole;
  currentStatus: UserStatus;
  blockedReason: string | null;
  isSelf?: boolean;
  onModerated?: (result: {
    profile: {
      id: string;
      role: UserRole;
      status: UserStatus;
      blockedReason: string | null;
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

export function AdminUserModerationPanel({
  userId,
  currentRole,
  currentStatus,
  blockedReason,
  isSelf = false,
  onModerated,
}: AdminUserModerationPanelProps) {
  const [action, setAction] = useState<UserAdminAction>("set_under_review");
  const [note, setNote] = useState(blockedReason ?? "");

  const availableActions = useMemo(() => {
    const actions: Array<{ value: UserAdminAction; label: string }> = [];

    if (currentStatus !== "active") {
      actions.push({ value: "set_active", label: "Set active" });
    }

    if (currentStatus !== "under_review") {
      actions.push({ value: "set_under_review", label: "Send to review" });
    }

    if (currentStatus !== "blocked") {
      actions.push({ value: "block", label: "Block user" });
    }

    if (currentStatus === "blocked") {
      actions.push({ value: "unblock", label: "Unblock user" });
    }

    if (currentRole !== "admin") {
      actions.push({ value: "make_admin", label: "Promote to admin" });
    }

    if (currentRole === "admin") {
      actions.push({ value: "make_user", label: "Demote to user" });
    }

    return actions;
  }, [currentRole, currentStatus]);

  const selectedAction = availableActions.some((item) => item.value === action)
    ? action
    : availableActions[0]?.value;

  const mutation = useMutation({
    mutationFn: async () => {
      const confirmationCopy: Partial<Record<UserAdminAction, string>> = {
        block: "Block this user from normal access?",
        make_admin: "Promote this user to admin access?",
        make_user: "Demote this account back to a normal user?",
      };

      const confirmation = selectedAction ? confirmationCopy[selectedAction] : null;

      if (confirmation && !window.confirm(confirmation)) {
        return null;
      }

      const response = await fetch(`/api/admin/users/${userId}/moderate`, {
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
        throw new Error(payload?.error?.message ?? "Failed to moderate user");
      }

      return payload.data as {
        profile: {
          id: string;
          role: UserRole;
          status: UserStatus;
          blockedReason: string | null;
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

      onModerated?.(result);
    },
  });

  if (isSelf) {
    return (
      <div className="grid gap-3 bg-background/55 p-4 ring-1 ring-border/35">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <UserRoundCog className="size-4 text-muted-foreground" />
          Self account
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          This workspace does not allow role or status changes on your own account.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 bg-background/55 p-4 ring-1 ring-border/35">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Shield className="size-4 text-muted-foreground" />
          User actions
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {currentRole} / {currentStatus}
        </p>
      </div>

      <Select
        value={selectedAction}
        onValueChange={(value) => setAction(value as UserAdminAction)}
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
        placeholder="Optional admin note. Used as block reason when blocking a user."
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
          <UserRoundCog className="size-4" />
        )}
      </Button>
    </div>
  );
}
