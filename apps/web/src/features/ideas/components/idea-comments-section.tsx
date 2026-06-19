"use client";

import { createPortal } from "react-dom";
import { useCallback, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { ConfirmDeleteAction } from "@/components/confirm-delete-action";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/features/auth/components/auth-modal";
import {
  useIdeaComments,
  type IdeaComment,
} from "@/features/ideas/api/use-idea-comments";

type IdeaCommentsSectionProps = {
    ideaId: string;
    comments: IdeaComment[];
    isAuthenticated: boolean;
    allowComments: boolean;
    nextPath?: string;
    commentsTargetId?: string;
    currentUserId?: string;
    ideaOwnerId?: string;
};

export function IdeaCommentsSection({
    ideaId,
    comments: initialComments,
    isAuthenticated,
    allowComments,
    nextPath,
    commentsTargetId,
    currentUserId,
    ideaOwnerId,
}: IdeaCommentsSectionProps) {
    const [comments, setComments] = useState(initialComments);
    const [body, setBody] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const mounted = useHydrated();
    const portalTarget = usePortalTarget(commentsTargetId);

    const {
        createComment: mutation,
        deleteComment: deleteMutation,
    } = useIdeaComments({
        ideaId,
        onCommentCreated: (comment) => {
            setComments((current) => [comment, ...current]);
            setBody("");
        },
        onCommentDeleted: (commentId) => {
            setComments((current) =>
                current.filter((comment) => comment.id !== commentId),
            );
            toast.success("Comment deleted");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (!allowComments || !body.trim()) {
            return;
        }

        mutation.mutate(body.trim());
    }

    return (
        <>
            <div className="border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Comments
                </h2>

                <form onSubmit={handleSubmit} className="mb-6 grid gap-3">
                    <textarea
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        className="min-h-28 border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                        placeholder="Share feedback, layout suggestions, or questions."
                    />
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            {allowComments
                                ? "Join the discussion."
                                : "Comments are disabled."}
                        </p>
                        <Button
                            type="submit"
                            disabled={mutation.isPending || !allowComments}
                        >
                            {isAuthenticated
                                ? mutation.isPending
                                    ? "Posting..."
                                    : "Post comment"
                                : "Sign in to comment"}
                        </Button>
                    </div>
                    {mutation.error ? (
                        <p className="text-sm text-red-600">
                            {mutation.error.message}
                        </p>
                    ) : null}
                </form>
            </div>

            {commentsTargetId ? (
                mounted && portalTarget ? (
                    createPortal(
                        <CommentsList
                            comments={comments}
                            currentUserId={currentUserId}
                            ideaOwnerId={ideaOwnerId}
                            deletingCommentId={deleteMutation.variables ?? null}
                            onDeleteComment={(commentId) =>
                                deleteMutation.mutate(commentId)
                            }
                            deleteError={deleteMutation.error?.message ?? null}
                        />,
                        portalTarget,
                    )
                ) : null
            ) : (
                <CommentsList
                    comments={comments}
                    currentUserId={currentUserId}
                    ideaOwnerId={ideaOwnerId}
                    deletingCommentId={deleteMutation.variables ?? null}
                    onDeleteComment={(commentId) =>
                        deleteMutation.mutate(commentId)
                    }
                    deleteError={deleteMutation.error?.message ?? null}
                />
            )}

            {showAuthModal ? (
                <AuthModal
                    title="Sign in to comment"
                    description="Join the discussion around this idea with your Google account."
                    next={nextPath ?? `/dashboard/ideas/${ideaId}`}
                    onClose={() => setShowAuthModal(false)}
                />
            ) : null}
        </>
    );
}

function CommentsList({
    comments,
    currentUserId,
    ideaOwnerId,
    deletingCommentId,
    onDeleteComment,
    deleteError,
}: {
    comments: IdeaComment[];
    currentUserId?: string;
    ideaOwnerId?: string;
    deletingCommentId: string | null;
    onDeleteComment: (commentId: string) => void;
    deleteError: string | null;
}) {
    function canDeleteComment(comment: IdeaComment) {
        return Boolean(
            currentUserId &&
                (currentUserId === comment.authorId ||
                    currentUserId === ideaOwnerId),
        );
    }

    return (
        <div className="border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">
                        Comments
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Feedback, questions, and quick reactions from readers.
                    </p>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {comments.length} total
                </p>
            </div>

            {deleteError ? (
                <p className="mb-4 text-sm text-red-600">{deleteError}</p>
            ) : null}

            <ul className="grid gap-4 text-sm text-muted-foreground lg:grid-cols-2">
                {comments.length === 0 ? (
                    <li className="border border-dashed border-border bg-background/50 p-5">
                        No comments yet.
                    </li>
                ) : (
                    comments.map((comment) => (
                        <li
                            key={comment.id}
                            className="grid gap-4 border border-border/70 bg-linear-to-br from-secondary/55 via-background to-background p-4 shadow-sm"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                                        {comment.authorName || "Anonymous"}
                                    </p>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                        {formatCommentTimestamp(
                                            comment.createdAt,
                                        )}
                                    </p>
                                </div>
                                {canDeleteComment(comment) ? (
                                    <ConfirmDeleteAction
                                        title="Delete this comment?"
                                        description="This removes the comment from the discussion feed permanently."
                                        actionLabel={
                                            deletingCommentId === comment.id
                                                ? "Deleting..."
                                                : "Delete comment"
                                        }
                                        variant="outline"
                                        size="xs"
                                        disabled={
                                            deletingCommentId === comment.id
                                        }
                                        onConfirm={() =>
                                            onDeleteComment(comment.id)
                                        }
                                        triggerClassName="shrink-0 text-[11px] uppercase tracking-[0.16em]"
                                    >
                                        {deletingCommentId === comment.id
                                            ? "Deleting..."
                                            : "Delete"}
                                    </ConfirmDeleteAction>
                                ) : null}
                            </div>
                            <p className="overflow-hidden whitespace-pre-wrap break-words text-sm leading-7 text-foreground [overflow-wrap:anywhere]">
                                {comment.body}
                            </p>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

function formatCommentTimestamp(value: string | Date) {
    const date = value instanceof Date ? value : new Date(value);

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function usePortalTarget(targetId?: string) {
    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            if (!targetId || typeof document === "undefined") {
                return () => {};
            }

            const target = document.getElementById(targetId);
            if (target) {
                return () => {};
            }

            const observer = new MutationObserver(() => {
                if (document.getElementById(targetId)) {
                    onStoreChange();
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            return () => observer.disconnect();
        },
        [targetId],
    );

    const getSnapshot = useCallback(() => {
        if (!targetId || typeof document === "undefined") {
            return null;
        }

        return document.getElementById(targetId);
    }, [targetId]);

    return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

function useHydrated() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
}
