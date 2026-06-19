"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthModal } from "@/features/auth/components/auth-modal";
import { useToggleReaction } from "@/features/ideas/hooks/use-toggle-reaction";

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

  const mutation = useToggleReaction(ideaId, {
    onSuccess(result) {
      setReacted(result.reacted);
      setCount(result.count);
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
