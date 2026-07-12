import type { AnalyticsPeriod, DateRange, VolumeBucketUnit } from "@/lib/analytics/period";
import { getDateRangeForPeriod } from "@/lib/analytics/period";

const mediumDateFormatter = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });
const longDateFormatter = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" });
const monthYearFormatter = new Intl.DateTimeFormat("nl-NL", {
  month: "long",
  year: "numeric",
});

export function formatDateRangeLabel(range: DateRange): string {
  if (!range.start) {
    return "Alle beschikbare data";
  }

  return `${mediumDateFormatter.format(range.start)} – ${mediumDateFormatter.format(range.end)}`;
}

export function formatPeriodDateRange(period: AnalyticsPeriod, now: Date = new Date()): string {
  return formatDateRangeLabel(getDateRangeForPeriod(period, now));
}

export function getVolumeBucketDateRange(
  bucketKey: string,
  unit: VolumeBucketUnit
): { createdFrom: string; createdTo: string } {
  if (unit === "day") {
    const start = new Date(`${bucketKey}T00:00:00.000Z`);
    const end = new Date(`${bucketKey}T23:59:59.999Z`);
    return { createdFrom: start.toISOString(), createdTo: end.toISOString() };
  }

  if (unit === "week") {
    const start = new Date(`${bucketKey}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    return { createdFrom: start.toISOString(), createdTo: end.toISOString() };
  }

  const [year, month] = bucketKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { createdFrom: start.toISOString(), createdTo: end.toISOString() };
}

export function formatVolumeBucketDateRange(
  bucketKey: string,
  unit: VolumeBucketUnit
): string {
  const { createdFrom, createdTo } = getVolumeBucketDateRange(bucketKey, unit);
  const start = new Date(createdFrom);
  const end = new Date(createdTo);

  if (unit === "day") {
    return longDateFormatter.format(start);
  }

  if (unit === "week") {
    return `${mediumDateFormatter.format(start)} – ${mediumDateFormatter.format(end)}`;
  }

  return monthYearFormatter.format(start);
}

export const WEEKDAY_FULL_LABELS = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
] as const;

export function getWeekdayFullLabel(weekday: number): string {
  return WEEKDAY_FULL_LABELS[weekday] ?? "Onbekend";
}

export function formatWeekdayInPeriod(weekday: number, period: AnalyticsPeriod): string {
  const day = getWeekdayFullLabel(weekday);
  const range = formatPeriodDateRange(period);
  return `${day} · ${range}`;
}
