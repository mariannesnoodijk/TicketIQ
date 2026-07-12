"use client";

import { CalendarRange } from "lucide-react";

import { useLocale } from "@/components/providers/locale-provider";
import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import { getAnalyticsPeriodOptions } from "@/lib/i18n/labels";
import { getPeriodLabel, type AnalyticsPeriod } from "@/lib/analytics/period";
import { cn } from "@/lib/utils";

type AnalyticsPeriodSelectorProps = {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  description?: string;
};

export function AnalyticsPeriodSelector({
  value,
  onChange,
  description,
}: AnalyticsPeriodSelectorProps) {
  const { t, locale } = useLocale();
  const dateRangeLabel = formatPeriodDateRange(value, locale);
  const periodLabel = getPeriodLabel(value, locale);
  const periodOptions = getAnalyticsPeriodOptions(locale);
  const resolvedDescription = description ?? t("analytics.periodDescription");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t("analytics.periodLabel")}</p>
          <p className="text-xs text-muted-foreground">{resolvedDescription}</p>
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1"
          role="group"
          aria-label={t("analytics.periodLabel")}
        >
          {periodOptions.map((option) => (
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
          <span>{t("analytics.periodSelected", { period: periodLabel })}</span>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{dateRangeLabel}</p>
      </div>
    </div>
  );
}
