import { CalendarDays, LayoutPanelTop, Sparkles, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { formatDateLabel, formatIsoDateLabel } from "./idea-tub-utils";

type IdeaTubOverviewProps = {
  calendarDays: Array<{ value: string; inMonth: boolean }>;
  monthLabel: string;
  selectedDate: string | null;
  selectedDayCount: number;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
  shiftMonth: (direction: -1 | 1) => void;
  statusSummary: {
    planned: number;
    ongoing: number;
    shared: number;
    completed: number;
  };
  taskCountByDate: Map<string, number>;
  taskCount: number;
  updatedAt: string;
};

export function IdeaTubOverview({
  calendarDays,
  monthLabel,
  selectedDate,
  selectedDayCount,
  setSelectedDate,
  shiftMonth,
  statusSummary,
  taskCountByDate,
  taskCount,
  updatedAt,
}: IdeaTubOverviewProps) {
  return (
    <Card className="border-border bg-card/94 shadow-xl backdrop-blur">
      <CardContent className="grid gap-4 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <SummaryTile label="Planned" value={String(statusSummary.planned)} hint="Across project" icon={LayoutPanelTop} />
          <SummaryTile label="Ongoing" value={String(statusSummary.ongoing)} hint="Across project" icon={CalendarDays} />
          <SummaryTile label="Shared" value={String(statusSummary.shared)} hint="Across project" icon={Sparkles} />
          <SummaryTile label="Completed" value={String(statusSummary.completed)} hint={`${taskCount} total tasks`} icon={LayoutPanelTop} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryTile
            label="Date"
            value={String(selectedDayCount)}
            hint={selectedDate ? formatDateLabel(selectedDate) : "Pick a day"}
            icon={CalendarDays}
          />
          <SummaryTile
            label="Updated"
            value={formatIsoDateLabel(updatedAt)}
            hint="Idea"
            icon={Sparkles}
          />
        </div>

        <div className="grid gap-3 border border-border bg-background/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Calendar
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">Dates</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(-1)}>
                Previous
              </Button>
              <p className="min-w-28 text-center text-sm font-semibold text-foreground">{monthLabel}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(1)}>
                Next
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day) => {
              const count = taskCountByDate.get(day.value) ?? 0;
              const isActive = day.value === selectedDate;

              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setSelectedDate(day.value)}
                  className={cn(
                    "grid min-h-14 content-between border border-border bg-background/70 px-2 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-card",
                    isActive && "border-primary bg-secondary/60",
                    !day.inMonth && "opacity-45",
                  )}
                >
                  <span className="text-xs font-semibold text-foreground">
                    {Number(day.value.slice(-2))}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {count > 0 ? `${count}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <div className="border border-border bg-background/75 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className="flex size-9 items-center justify-center border border-border bg-card">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
