"use client";

import { CalendarRange } from "lucide-react";

import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import {
  ANALYTICS_PERIOD_OPTIONS,
  getPeriodLabel,
  type AnalyticsPeriod,
} from "@/lib/analytics/period";
import { cn } from "@/lib/utils";

type AnalyticsPeriodSelectorProps = {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  description?: string;
};

export function AnalyticsPeriodSelector({
  value,
  onChange,
  description = "Alle grafieken hieronder tonen data uit hetzelfde datumbereik.",
}: AnalyticsPeriodSelectorProps) {
  const dateRangeLabel = formatPeriodDateRange(value);
  const periodLabel = getPeriodLabel(value);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Analytics-periode</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1"
          role="group"
          aria-label="Analytics-periode"
        >
          {ANALYTICS_PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                value === option.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 text-sm font-medium text-primary">
          <CalendarRange className="size-4 shrink-0" aria-hidden />
          <span>Geselecteerd: {periodLabel}</span>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{dateRangeLabel}</p>
      </div>
    </div>
  );
}
