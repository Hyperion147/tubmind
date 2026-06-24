"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AuthModal } from "@/features/auth/components/auth-modal";
import { useToggleReaction } from "../api/use-toggle-reaction";

type PublicIdeaReactionStatProps = {
    ideaId: string;
    initialCount: number;
    initialReacted: boolean;
    isAuthenticated: boolean;
    nextPath: string;
};

export function PublicIdeaReactionStat({
    ideaId,
    initialCount,
    initialReacted,
    isAuthenticated,
    nextPath,
}: PublicIdeaReactionStatProps) {
    const [count, setCount] = useState(initialCount);
    const [reacted, setReacted] = useState(initialReacted);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const mutation = useToggleReaction(ideaId, {
        onSuccess(result) {
            setReacted(result.reacted);
            setCount(result.count);
        },
    });

    function handleToggleReaction() {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (mutation.isPending) {
            return;
        }

        const previousCount = count;
        const previousReacted = reacted;
        const nextReacted = !reacted;

        setReacted(nextReacted);
        setCount((current) =>
            Math.max(0, current + (nextReacted ? 1 : -1)),
        );

        mutation.mutate(undefined, {
            onError(error) {
                setReacted(previousReacted);
                setCount(previousCount);
                toast.error("Like failed", {
                    description: error.message,
                });
            },
        });
    }

    return (
        <>
            <div className="border border-border bg-background/70 p-4 transition-colors duration-300 hover:border-primary/35 hover:bg-background">
                <div className="flex items-center justify-start gap-2">
                    <Sparkles className="size-4 text-muted-foreground" />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Likes
                    </p>
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="truncate text-xl font-semibold text-foreground">
                        {count}
                    </p>
                    <Button
                        type="button"
                        onClick={handleToggleReaction}
                        variant={reacted ? "secondary" : "outline"}
                        size="xs"
                        aria-busy={mutation.isPending}
                        className="gap-2 text-[11px] uppercase tracking-[0.16em]"
                    >
                        <Sparkles className="size-3.5" />
                        {reacted ? "Liked" : "Like"}
                    </Button>
                </div>
            </div>

            {showAuthModal ? (
                <AuthModal
                    title="Sign in to react"
                    description="Save a quick like on this idea with your Google account."
                    next={nextPath}
                    onClose={() => setShowAuthModal(false)}
                />
            ) : null}
        </>
    );
}
