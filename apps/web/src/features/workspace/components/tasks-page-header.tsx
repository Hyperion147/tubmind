"use client";

import Link from "next/link";
import { List as ListIcon, Plus, Search, SquareKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { SetSearchParams, ViewMode } from "./tasks-page-types";

type TasksPageHeaderProps = {
    isPending: boolean;
    query: string;
    setSearchParams: SetSearchParams;
    view: ViewMode;
};

export function TasksPageHeader({
    isPending,
    query,
    setSearchParams,
    view,
}: TasksPageHeaderProps) {
    return (
        <section className="grid gap-4 border border-border bg-card/90 shadow-sm p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                    <Badge variant="outline" className="w-fit font-mono">
                        Tasks
                    </Badge>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground xl:text-[3rem]">
                            Delivery board
                        </h1>
                    </div>
                </div>

                <div className="grid xl:min-w-[41rem] items-end-safe h-full">
                    <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-4 top-4.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) => {
                                    const nextQuery = event.target.value;
                                    setSearchParams({
                                        q: nextQuery.trim() ? nextQuery : null,
                                        page: null,
                                    });
                                }}
                                placeholder="Search tasks or ideas"
                                className="bg-background pl-11"
                            />
                        </label>
                        <Button
                            asChild
                            className="rounded-none px-4"
                            variant="fill"
                        >
                            <Link href="/dashboard/ideas" className="gap-2">
                                <Plus className="size-4" />
                                <span>New task</span>
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                            type="button"
                            onClick={() => {
                                setSearchParams({
                                    view: null,
                                });
                            }}
                            variant={view === "list" ? "fill" : "fill2"}
                        >
                            <ListIcon className="size-4" />
                            <span>List view</span>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setSearchParams({
                                    view: "board",
                                });
                            }}
                            variant={view === "board" ? "fill" : "fill2"}
                        >
                            <SquareKanban className="size-4" />
                            <span>Board view</span>
                        </Button>
                    </div>
                </div>
            </div>
            {isPending ? (
                <p className="text-sm text-muted-foreground">Updating view...</p>
            ) : null}
        </section>
    );
}
