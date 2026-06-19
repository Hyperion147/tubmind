"use client";

import { Loader2, Shield, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  AdminUserAction,
  AdminUserResult,
  UserRole,
  UserStatus,
} from "@tubmind/contracts/moderation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useModerateUser } from "@/features/admin/api/use-moderation";

type AdminUserModerationPanelProps = {
  userId: string;
  currentRole: UserRole;
  currentStatus: UserStatus;
  blockedReason: string | null;
  isSelf?: boolean;
  onModerated?: (result: AdminUserResult) => void;
};

export function AdminUserModerationPanel({
  userId,
  currentRole,
  currentStatus,
  blockedReason,
  isSelf = false,
  onModerated,
}: AdminUserModerationPanelProps) {
  const router = useRouter();
  const [action, setAction] = useState<AdminUserAction>("set_under_review");
  const [note, setNote] = useState(blockedReason ?? "");
  const mutation = useModerateUser(userId, (result) => {
    onModerated?.(result);
    router.refresh();
  });

  const availableActions = useMemo(() => {
    const actions: Array<{ value: AdminUserAction; label: string }> = [];

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

  async function applyAction() {
    const confirmationCopy: Partial<Record<AdminUserAction, string>> = {
      block: "Block this user from normal access?",
      make_admin: "Promote this user to admin access?",
      make_user: "Demote this account back to a normal user?",
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
        onValueChange={(value) => setAction(value as AdminUserAction)}
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
        onClick={applyAction}
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
