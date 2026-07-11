import { CalendarRange } from "lucide-react";

import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import type { AnalyticsPeriod } from "@/lib/analytics/period";
import { cn } from "@/lib/utils";

type ChartPeriodRangeProps = {
  period: AnalyticsPeriod;
  className?: string;
  /** Optioneel: specifiek datumbereik i.p.v. de analytics-periode (bijv. één staaf). */
  overrideLabel?: string;
};

export function ChartPeriodRange({ period, className, overrideLabel }: ChartPeriodRangeProps) {
  const label = overrideLabel ?? formatPeriodDateRange(period);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
        className
      )}
    >
      <CalendarRange className="size-3.5 shrink-0" aria-hidden />
      <span className="tabular-nums">{label}</span>
    </div>
  );
}
