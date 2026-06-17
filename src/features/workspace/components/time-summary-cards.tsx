import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SummaryStat({
  icon: Icon,
  label,
  value,
  destructive = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  destructive?: boolean;
}) {
  return (
    <div className="border border-border bg-background/70 p-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", destructive ? "text-destructive" : "text-muted-foreground")} />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className={cn("mt-2 text-2xl font-semibold", destructive ? "text-destructive" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

export function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/70 p-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
