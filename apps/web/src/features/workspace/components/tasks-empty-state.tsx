import { Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function TasksEmptyState() {
    return (
        <Card className="border border-border bg-card/92 shadow-sm">
            <CardContent className="grid min-h-[18rem] place-items-center p-8 text-center">
                <div className="space-y-4">
                    <div className="mx-auto flex size-16 items-center justify-center bg-secondary text-primary">
                        <Target className="size-7" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                            No tasks match right now
                        </h2>
                        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                            Adjust the search, or create new work from one of
                            your idea tubs.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
