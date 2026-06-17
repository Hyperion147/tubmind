"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDeleteAction } from "@/components/confirm-delete-action";

type DeleteIdeaButtonProps = {
  ideaId: string;
};

export function DeleteIdeaButton({ ideaId }: DeleteIdeaButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to delete idea");
      }

      return payload.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ideas", "mine"] });
      toast.success("Idea deleted");
      router.push("/dashboard/ideas");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="grid gap-2">
      <ConfirmDeleteAction
        title="Delete this idea?"
        description="This permanently removes the idea, its tub tasks, comments, reactions, and related data. This cannot be undone."
        actionLabel={mutation.isPending ? "Deleting..." : "Delete idea"}
        disabled={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        triggerClassName="justify-between rounded-none"
      >
        {mutation.isPending ? "Deleting..." : "Delete idea"}
        <Trash2 className="size-4" />
      </ConfirmDeleteAction>
      {mutation.error ? (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      ) : null}
    </div>
  );
}
