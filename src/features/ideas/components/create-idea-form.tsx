"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CheckSquare,
    FilePenLine,
    Globe2,
    Lightbulb,
    LockKeyhole,
    Send,
    Square,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuthModal } from "@/features/auth/components/auth-modal";
import {
    createIdeaSchema,
    type CreateIdeaFormValues,
    type CreateIdeaInput,
} from "@/lib/validators/idea";
import { cn } from "@/lib/utils";

const defaultValues: CreateIdeaFormValues = {
    title: "",
    summary: "",
    description: "",
    progressNotes: "",
    status: "draft",
    visibility: "private",
    allowComments: true,
    isFeatured: false,
    details: {
        problem: "",
        targetAudience: "",
        designStyle: "",
        budgetRange: "",
        timeline: "",
        spaceType: "",
        properties: {},
        metadata: {},
    },
    features: [],
    techStacks: [],
};

type CreateIdeaFormProps = {
    isAuthenticated: boolean;
    variant?: "full" | "compact" | "ideas-page";
};

export function CreateIdeaForm({
    isAuthenticated,
    variant = "full",
}: CreateIdeaFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isCaptureActive, setIsCaptureActive] = useState(false);
    const isCompact = variant === "compact";

    const form = useForm<CreateIdeaFormValues, unknown, CreateIdeaInput>({
        resolver: zodResolver(createIdeaSchema as never),
        defaultValues,
    });

    const mutation = useMutation<{ id: string }, Error, CreateIdeaInput>({
        mutationFn: async (values: CreateIdeaInput) => {
            const response = await fetch("/api/ideas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(
                    payload?.error?.message ?? "Failed to create idea",
                );
            }

            return payload.data;
        },
        onSuccess: async (createdIdea) => {
            await queryClient.invalidateQueries({
                queryKey: ["ideas", "mine"],
            });
            form.reset(defaultValues);
            router.push(`/dashboard/projects/${createdIdea.id}`);
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        mutation.mutate(values);
    });

    const status = useWatch({ control: form.control, name: "status" });
    const visibility = useWatch({ control: form.control, name: "visibility" });
    const allowComments = useWatch({
        control: form.control,
        name: "allowComments",
    });
    const isIdeasPage = variant === "ideas-page";

    if (isCompact) {
        return (
            <>
                <form onSubmit={onSubmit} className="grid gap-3 h-fit">
                    <div
                        className="group/capture relative border border-border bg-card/95 p-3 shadow-2xl backdrop-blur transition-colors duration-300 hover:border-primary/40 hover:bg-card focus-within:border-primary focus-within:bg-card"
                        onMouseEnter={() => setIsCaptureActive(true)}
                        onMouseLeave={() => setIsCaptureActive(false)}
                        onFocusCapture={() => setIsCaptureActive(true)}
                        onBlurCapture={(event) => {
                            if (
                                !event.currentTarget.contains(
                                    event.relatedTarget as Node | null,
                                )
                            ) {
                                setIsCaptureActive(false);
                            }
                        }}
                    >
                        <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute -left-px -top-px size-4"
                            style={{ transformOrigin: "top left" }}
                            animate={{
                                x: isCaptureActive ? 8 : 0,
                                y: isCaptureActive ? 8 : 0,
                                scale: isCaptureActive ? 1.15 : 1,
                                rotateX: isCaptureActive ? -10 : 0,
                                rotateY: isCaptureActive ? 10 : 0,
                            }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <span className="absolute left-0 top-0 h-1 w-4 bg-primary" />
                            <span className="absolute left-0 top-0 h-4 w-1 bg-primary" />
                        </motion.div>
                        <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-px -right-px size-4"
                            style={{ transformOrigin: "bottom right" }}
                            animate={{
                                x: isCaptureActive ? -8 : 0,
                                y: isCaptureActive ? -8 : 0,
                                scale: isCaptureActive ? 1.15 : 1,
                                rotateX: isCaptureActive ? 10 : 0,
                                rotateY: isCaptureActive ? -10 : 0,
                            }}
                            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <span className="absolute bottom-0 right-0 h-1 w-4 bg-primary" />
                            <span className="absolute bottom-0 right-0 h-4 w-1 bg-primary" />
                        </motion.div>
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
                            <label
                                htmlFor="title"
                                className="flex min-h-12 items-center border border-border bg-background/75 transition group-focus-within/capture:bg-background"
                            >
                                <Input
                                    id="title"
                                    {...form.register("title")}
                                    placeholder="Enter your idea..."
                                    className="h-10 border-0 bg-transparent px-0 text-center text-[15px] shadow-none focus-visible:ring-0 md:text-left"
                                />
                            </label>

                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                size="icon"
                                className="h-12 w-full transition-colors duration-300 hover:bg-primary/90"
                                aria-label="Create idea"
                            >
                                {mutation.isPending ? (
                                    <span className="font-mono">
                                        Submitting ideas...
                                    </span>
                                ) : (
                                    <span className="font-mono">
                                        Capture your idea
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] z-9999">
                        <button
                            type="button"
                            onClick={() =>
                                form.setValue(
                                    "status",
                                    status === "draft" ? "submitted" : "draft",
                                )
                            }
                            className={cn(
                                "inline-flex min-h-10 items-center justify-center gap-2 border border-border bg-card/90 px-3 py-2 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:border-primary/55 hover:bg-secondary/80 hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_color-mix(in_oklch,var(--primary)_18%,transparent)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                                status === "draft" &&
                                    "border-primary/35 bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_0_0_1px_color-mix(in_oklch,var(--primary)_16%,transparent)]",
                            )}
                        >
                            {status === "draft" ? (
                                <FilePenLine className="size-3.5" />
                            ) : (
                                <Send className="size-3.5" />
                            )}
                            {status === "draft" ? "Draft" : "Submitted"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                form.setValue(
                                    "visibility",
                                    visibility === "private"
                                        ? "public"
                                        : "private",
                                )
                            }
                            className={cn(
                                "inline-flex min-h-10 items-center gap-2 border border-border bg-card/90 px-3 py-2 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:border-primary/55 hover:bg-secondary/80 hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_color-mix(in_oklch,var(--primary)_18%,transparent)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                                visibility === "private" &&
                                    "border-primary/35 bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_0_0_1px_color-mix(in_oklch,var(--primary)_16%,transparent)]",
                            )}
                        >
                            {visibility === "private" ? (
                                <LockKeyhole className="size-3.5" />
                            ) : (
                                <Globe2 className="size-3.5" />
                            )}
                            {visibility}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                form.setValue(
                                    "allowComments",
                                    !allowComments,
                                )
                            }
                            className={cn(
                                "inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border bg-card/90 px-3 py-2 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:border-primary/55 hover:bg-secondary/80 hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_color-mix(in_oklch,var(--primary)_18%,transparent)] active:translate-y-px focus-within:ring-2 focus-within:ring-ring/50",
                                allowComments &&
                                    "border-primary/35 bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_0_0_1px_color-mix(in_oklch,var(--primary)_16%,transparent)]",
                            )}
                        >
                            {allowComments ? (
                                <CheckSquare className="size-3.5" />
                            ) : (
                                <Square className="size-3.5" />
                            )}
                            Comments
                        </button>

                        <span className="ml-auto hidden border border-border bg-card/80 px-3 py-2 text-muted-foreground md:inline-flex">
                            {isAuthenticated
                                ? "signed in"
                                : "google login required"}
                        </span>
                    </div>

                    {form.formState.errors.title ? (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.title.message}
                        </p>
                    ) : null}

                    {mutation.error ? (
                        <p className="text-sm text-destructive">
                            {mutation.error.message}
                        </p>
                    ) : null}

                    {mutation.isSuccess ? (
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                            Idea saved. Opening room for details next.
                        </p>
                    ) : null}
                </form>

                {showAuthModal ? (
                    <AuthModal
                        title="Sign in to add an idea"
                        description="Tubmind only lets signed-in users create and save new ideas."
                        next="/"
                        onClose={() => setShowAuthModal(false)}
                    />
                ) : null}
            </>
        );
    }

    const content = (
        <>
            <form onSubmit={onSubmit} className="contents h-fit">
                {isIdeasPage ? (
                    <div className="grid gap-4">
                        <div className="grid gap-4 border-b border-border pb-6 sm:grid-cols-[auto_1fr] sm:items-start">
                            <div className="flex size-12 items-center justify-center bg-secondary text-primary">
                                <Lightbulb className="size-6" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-[2rem] font-semibold tracking-tight text-foreground">
                                    Create an idea
                                </h2>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <label
                                    htmlFor="title"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Idea title
                                </label>
                                <Input
                                    id="title"
                                    {...form.register("title")}
                                    placeholder="Give your idea a clear, short title"
                                    className="h-11 bg-background/78"
                                />
                                {form.formState.errors.title ? (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.title.message}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor="summary"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Summary
                                </label>
                                <Textarea
                                    id="summary"
                                    {...form.register("summary")}
                                    placeholder="Write a short summary of the idea"
                                    className="min-h-24 bg-background/78"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor="description"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Description <span className="text-muted-foreground">(optional)</span>
                                </label>
                                <Textarea
                                    id="description"
                                    {...form.register("description")}
                                    placeholder="Describe the idea, why it matters, and how it could become useful."
                                    className="min-h-28 bg-background/78"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Status
                                    </label>
                                    <Select
                                        defaultValue={form.getValues("status")}
                                        onValueChange={(value) =>
                                            form.setValue(
                                                "status",
                                                value as CreateIdeaInput["status"],
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full bg-background/78">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="in_progress">
                                                In progress
                                            </SelectItem>
                                            <SelectItem value="submitted">
                                                Submitted
                                            </SelectItem>
                                            <SelectItem value="published">
                                                Published
                                            </SelectItem>
                                            <SelectItem value="needs_revision">
                                                Needs revision
                                            </SelectItem>
                                            <SelectItem value="archived">
                                                Archived
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Visibility
                                    </label>
                                    <Select
                                        defaultValue={form.getValues("visibility")}
                                        onValueChange={(value) =>
                                            form.setValue(
                                                "visibility",
                                                value as CreateIdeaInput["visibility"],
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full bg-background/78">
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">
                                                Private
                                            </SelectItem>
                                            <SelectItem value="public">
                                                Public
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 border border-border bg-secondary/50 px-4 py-3 text-sm text-secondary-foreground">
                                <Checkbox
                                    checked={allowComments}
                                    onCheckedChange={(checked) =>
                                        form.setValue(
                                            "allowComments",
                                            checked === true,
                                        )
                                    }
                                    className="rounded-none"
                                />
                                Allow logged-in users to comment
                            </label>

                            {mutation.error ? (
                                <p className="text-sm text-destructive">
                                    {mutation.error.message}
                                </p>
                            ) : null}

                            {mutation.isSuccess ? (
                                <p className="text-sm text-primary">
                                    Idea saved successfully.
                                </p>
                            ) : null}

                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                variant={mutation.isPending ? "outline" : "fill"}
                                size="lg"
                                className="h-11"
                            >
                                <span>{mutation.isPending ? "Saving..." : "Create idea"}</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Card className="relative gap-0 overflow-hidden border-0 bg-card/96 shadow-xl ring-1 ring-primary/10 backdrop-blur">
                        <CardHeader className="space-y-3">
                            <CardTitle className="text-2xl font-semibold text-foreground">
                                Capture an idea
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <label
                                    htmlFor="title"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Idea title
                                </label>
                                <Input
                                    id="title"
                                    {...form.register("title")}
                                    placeholder="Voice notes for creators who get their best ideas in the shower"
                                    className="h-12 bg-background/70"
                                />
                                {form.formState.errors.title ? (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.title.message}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor="summary"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Summary
                                </label>
                                <Textarea
                                    id="summary"
                                    {...form.register("summary")}
                                    placeholder="One quick overview for the dashboard and listings cards."
                                    className="min-h-24 bg-background/70"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor="description"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    {...form.register("description")}
                                    placeholder="Describe the idea, why it matters, and how it could become useful."
                                    className="min-h-32 bg-background/70"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Status
                                    </label>
                                    <Select
                                        defaultValue={form.getValues("status")}
                                        onValueChange={(value) =>
                                            form.setValue(
                                                "status",
                                                value as CreateIdeaInput["status"],
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-11 w-full bg-background/70">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="in_progress">
                                                In progress
                                            </SelectItem>
                                            <SelectItem value="submitted">
                                                Submitted
                                            </SelectItem>
                                            <SelectItem value="published">
                                                Published
                                            </SelectItem>
                                            <SelectItem value="needs_revision">
                                                Needs revision
                                            </SelectItem>
                                            <SelectItem value="archived">
                                                Archived
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Visibility
                                    </label>
                                    <Select
                                        defaultValue={form.getValues("visibility")}
                                        onValueChange={(value) =>
                                            form.setValue(
                                                "visibility",
                                                value as CreateIdeaInput["visibility"],
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-11 w-full bg-background/70">
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">
                                                Private
                                            </SelectItem>
                                            <SelectItem value="public">
                                                Public
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <label className="flex items-center gap-3 border border-border bg-secondary/50 px-4 py-2 text-sm text-secondary-foreground">
                                    <Checkbox
                                        checked={allowComments}
                                        onCheckedChange={(checked) =>
                                            form.setValue(
                                                "allowComments",
                                                checked === true,
                                            )
                                        }
                                        className="rounded-none"
                                    />
                                    Allow logged-in users to comment
                                </label>
                            </div>

                            {mutation.error ? (
                                <p className="text-sm text-destructive">
                                    {mutation.error.message}
                                </p>
                            ) : null}

                            {mutation.isSuccess ? (
                                <p className="text-sm text-primary">
                                    Idea saved successfully.
                                </p>
                            ) : null}

                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                size="lg"
                                className="h-11"
                            >
                                {mutation.isPending ? "Saving..." : "Create idea"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </form>

            {showAuthModal ? (
                <AuthModal
                    title="Sign in to add an idea"
                    description="Tubmind only lets signed-in users create and save new ideas."
                    next="/"
                    onClose={() => setShowAuthModal(false)}
                />
            ) : null}
        </>
    );

    return content;
}
