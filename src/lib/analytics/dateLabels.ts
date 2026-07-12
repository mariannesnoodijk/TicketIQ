import type { AnalyticsPeriod, DateRange, VolumeBucketUnit } from "@/lib/analytics/period";
import { getDateRangeForPeriod } from "@/lib/analytics/period";
import { getIntlLocale } from "@/lib/i18n/labels";
import { messages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

function createDateFormatters(locale: Locale) {
  const intlLocale = getIntlLocale(locale);
  return {
    medium: new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" }),
    long: new Intl.DateTimeFormat(intlLocale, { dateStyle: "long" }),
    monthYear: new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }),
  };
}

export function formatDateRangeLabel(range: DateRange, locale: Locale = "nl"): string {
  if (!range.start) {
    return messages[locale].common.allAvailableData;
  }

  const formatters = createDateFormatters(locale);
  return `${formatters.medium.format(range.start)} – ${formatters.medium.format(range.end)}`;
}

export function formatPeriodDateRange(
  period: AnalyticsPeriod,
  locale: Locale = "nl",
  now: Date = new Date()
): string {
  return formatDateRangeLabel(getDateRangeForPeriod(period, now), locale);
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
  unit: VolumeBucketUnit,
  locale: Locale = "nl"
): string {
  const { createdFrom, createdTo } = getVolumeBucketDateRange(bucketKey, unit);
  const start = new Date(createdFrom);
  const end = new Date(createdTo);
  const formatters = createDateFormatters(locale);

  if (unit === "day") {
    return formatters.long.format(start);
  }

  if (unit === "week") {
    return `${formatters.medium.format(start)} – ${formatters.medium.format(end)}`;
  }

  return formatters.monthYear.format(start);
}

export function getWeekdayFullLabel(weekday: number, locale: Locale = "nl"): string {
  const labels = messages[locale].analytics.weekdaysFull;
  return labels[weekday] ?? messages[locale].common.unknown;
}

export function formatWeekdayInPeriod(
  weekday: number,
  period: AnalyticsPeriod,
  locale: Locale = "nl"
): string {
  const day = getWeekdayFullLabel(weekday, locale);
  const range = formatPeriodDateRange(period, locale);
  return `${day} · ${range}`;
}

/** @deprecated Use getWeekdayFullLabel(weekday, locale) */
export const WEEKDAY_FULL_LABELS = messages.nl.analytics.weekdaysFull;
