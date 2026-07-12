import { getAnalyticsPeriodLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/types";

export type AnalyticsPeriod = "day" | "week" | "30d" | "90d" | "year" | "all";

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = "30d";

/** @deprecated Use getAnalyticsPeriodOptions(locale) for localized labels */
export const ANALYTICS_PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "day", label: "Dag" },
  { value: "week", label: "Week" },
  { value: "30d", label: "30 dagen" },
  { value: "90d", label: "90 dagen" },
  { value: "year", label: "Jaar" },
  { value: "all", label: "Complete periode" },
];

export type DateRange = {
  start: Date | null;
  end: Date;
};

export function getDateRangeForPeriod(
  period: AnalyticsPeriod,
  now: Date = new Date()
): DateRange {
  const end = now;

  const daysAgo = (days: number) => new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  switch (period) {
    case "day":
      return { start: daysAgo(1), end };
    case "week":
      return { start: daysAgo(7), end };
    case "30d":
      return { start: daysAgo(30), end };
    case "90d":
      return { start: daysAgo(90), end };
    case "year":
      return { start: daysAgo(365), end };
    case "all":
      return { start: null, end };
  }
}

export function getPeriodLabel(period: AnalyticsPeriod, locale: Locale = "nl"): string {
  return getAnalyticsPeriodLabel(period, locale);
}

export type VolumeBucketUnit = "day" | "week" | "month";

export function getVolumeBucketUnit(period: AnalyticsPeriod): VolumeBucketUnit {
  switch (period) {
    case "day":
    case "week":
    case "30d":
      return "day";
    case "90d":
      return "week";
    case "year":
    case "all":
      return "month";
  }
}
