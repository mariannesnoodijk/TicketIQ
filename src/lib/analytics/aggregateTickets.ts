import type { CategoryDistribution, CategoryDistributionItem } from "@/hooks/useTicketCategoryStats";
import type { DateRange, VolumeBucketUnit } from "@/lib/analytics/period";
import { formatVolumeBucketDateRange } from "@/lib/analytics/dateLabels";
import { getIntlLocale } from "@/lib/i18n/labels";
import { messages } from "@/lib/i18n";
import { interpolate } from "@/lib/i18n/interpolate";
import type { Locale } from "@/lib/i18n/types";

const UNCATEGORIZED_COLOR = "#94a3b8";

export type TicketAnalyticsRow = {
  category_id: string | null;
  ticket_created_at: string | null;
  raw_payload: unknown;
};

export type VolumePoint = {
  label: string;
  count: number;
  bucketKey: string;
  dateRangeLabel: string;
};

export type WeekdayPoint = {
  weekday: number;
  label: string;
  count: number;
};

export type OrganizationPoint = {
  name: string;
  count: number;
};

type CategoryRow = {
  id: string;
  name: string;
  color: string | null;
};

function getTicketDate(ticket: TicketAnalyticsRow): Date | null {
  if (!ticket.ticket_created_at) {
    return null;
  }

  const date = new Date(ticket.ticket_created_at);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function filterTicketsByDateRange(
  tickets: TicketAnalyticsRow[],
  range: DateRange
): TicketAnalyticsRow[] {
  if (!range.start) {
    return tickets;
  }

  const startMs = range.start.getTime();
  const endMs = range.end.getTime();

  return tickets.filter((ticket) => {
    const date = getTicketDate(ticket);
    if (!date) {
      return false;
    }

    const time = date.getTime();
    return time >= startMs && time <= endMs;
  });
}

function getOrganizationName(rawPayload: unknown, locale: Locale): string {
  if (!rawPayload || typeof rawPayload !== "object") {
    return messages[locale].common.unknown;
  }

  const name = (rawPayload as { organisatie_naam?: unknown }).organisatie_naam;
  if (typeof name !== "string" || !name.trim()) {
    return messages[locale].common.unknown;
  }

  return name.trim();
}

function formatDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatWeekKey(date: Date): string {
  const day = new Date(date);
  const weekday = (day.getDay() + 6) % 7;
  day.setDate(day.getDate() - weekday);
  day.setHours(0, 0, 0, 0);
  return formatDayKey(day);
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDayLabel(key: string, locale: Locale): string {
  const date = new Date(`${key}T12:00:00`);
  return new Intl.DateTimeFormat(getIntlLocale(locale), { day: "numeric", month: "short" }).format(
    date
  );
}

function formatWeekLabel(key: string, locale: Locale): string {
  const date = new Date(`${key}T12:00:00`);
  const formatted = new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "short",
  }).format(date);
  return interpolate(messages[locale].analytics.weekLabel, { week: formatted });
}

function formatMonthLabel(key: string, locale: Locale): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(getIntlLocale(locale), { month: "short", year: "numeric" }).format(
    date
  );
}

export function buildVolumeSeries(
  tickets: TicketAnalyticsRow[],
  unit: VolumeBucketUnit,
  locale: Locale = "nl"
): VolumePoint[] {
  const counts = new Map<string, number>();

  for (const ticket of tickets) {
    const date = getTicketDate(ticket);
    if (!date) {
      continue;
    }

    const key =
      unit === "day"
        ? formatDayKey(date)
        : unit === "week"
          ? formatWeekKey(date)
          : formatMonthKey(date);

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({
      bucketKey: key,
      dateRangeLabel: formatVolumeBucketDateRange(key, unit, locale),
      label:
        unit === "day"
          ? formatDayLabel(key, locale)
          : unit === "week"
            ? formatWeekLabel(key, locale)
            : formatMonthLabel(key, locale),
      count,
    }));
}

export function buildWeekdayDistribution(
  tickets: TicketAnalyticsRow[],
  locale: Locale = "nl"
): WeekdayPoint[] {
  const counts = new Map<number, number>();
  const weekdayLabels = messages[locale].analytics.weekdaysShort;

  for (const ticket of tickets) {
    const date = getTicketDate(ticket);
    if (!date) {
      continue;
    }

    const jsDay = date.getDay();
    const weekday = jsDay === 0 ? 6 : jsDay - 1;
    counts.set(weekday, (counts.get(weekday) ?? 0) + 1);
  }

  return weekdayLabels.map((label, weekday) => ({
    weekday,
    label,
    count: counts.get(weekday) ?? 0,
  }));
}

export function buildTopOrganizations(
  tickets: TicketAnalyticsRow[],
  locale: Locale = "nl",
  limit = 8
): OrganizationPoint[] {
  const counts = new Map<string, number>();

  for (const ticket of tickets) {
    const name = getOrganizationName(ticket.raw_payload, locale);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function buildCategoryDistribution(
  tickets: TicketAnalyticsRow[],
  categories: CategoryRow[],
  locale: Locale = "nl"
): CategoryDistribution {
  const total = tickets.length;
  const countByCategoryId = new Map<string | null, number>();

  for (const ticket of tickets) {
    const key = ticket.category_id;
    countByCategoryId.set(key, (countByCategoryId.get(key) ?? 0) + 1);
  }

  const items: CategoryDistributionItem[] = categories.map((category) => {
    const count = countByCategoryId.get(category.id) ?? 0;
    return {
      categoryId: category.id,
      name: category.name,
      color: category.color ?? "#6366f1",
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  const uncategorizedCount = countByCategoryId.get(null) ?? 0;

  if (uncategorizedCount > 0) {
    items.push({
      categoryId: null,
      name: messages[locale].common.uncategorized,
      color: UNCATEGORIZED_COLOR,
      count: uncategorizedCount,
      percentage: total > 0 ? Math.round((uncategorizedCount / total) * 100) : 0,
    });
  }

  items.sort((a, b) => b.count - a.count);

  return { total, items };
}

export function getTicketOrganizationName(rawPayload: unknown, locale: Locale = "nl"): string {
  return getOrganizationName(rawPayload, locale);
}

export function ticketMatchesWeekday(
  ticketCreatedAt: string | null,
  weekday: number
): boolean {
  if (!ticketCreatedAt) {
    return false;
  }

  const date = new Date(ticketCreatedAt);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const jsDay = date.getDay();
  const mapped = jsDay === 0 ? 6 : jsDay - 1;
  return mapped === weekday;
}

export function ticketMatchesOrganization(rawPayload: unknown, organization: string): boolean {
  return getOrganizationName(rawPayload, "nl") === organization;
}
