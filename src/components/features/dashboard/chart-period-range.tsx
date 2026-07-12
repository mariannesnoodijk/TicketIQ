import { CalendarRange } from "lucide-react";

import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import type { AnalyticsPeriod } from "@/lib/analytics/period";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type ChartPeriodRangeProps = {
  period: AnalyticsPeriod;
  locale: Locale;
  className?: string;
  overrideLabel?: string;
};

export function ChartPeriodRange({
  period,
  locale,
  className,
  overrideLabel,
}: ChartPeriodRangeProps) {
  const label = overrideLabel ?? formatPeriodDateRange(period, locale);

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
