"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthModal } from "@/features/auth/components/auth-modal";

export function ListingCardLikeButton({
  ideaId,
  initialCount,
  initialReacted,
  isAuthenticated,
  nextPath,
}: {
  ideaId: string;
  initialCount: number;
  initialReacted: boolean;
  isAuthenticated: boolean;
  nextPath: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/reactions`, {
        method: "POST",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to update reaction");
      }

      return payload.data as { reacted: boolean; count: number };
    },
    onSuccess: (payload) => {
      setReacted(payload.reacted);
      setCount(payload.count);
    },
  });

  function handleClick() {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    mutation.mutate();
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{count} likes</span>
        <Button
          type="button"
          onClick={handleClick}
          variant={reacted ? "secondary" : "outline"}
          size="xs"
          disabled={mutation.isPending}
          className="gap-2"
        >
          <Heart className="size-3.5" />
          {reacted ? "Liked" : "Like"}
        </Button>
      </div>

      {showAuthModal ? (
        <AuthModal
          title="Sign in to like"
          description="Use your Google account to react to public ideas."
          next={nextPath}
          onClose={() => setShowAuthModal(false)}
        />
      ) : null}
    </>
  );
}
