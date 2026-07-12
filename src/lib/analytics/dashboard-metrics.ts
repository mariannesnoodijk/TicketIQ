import type { VolumePoint, WeekdayPoint } from "@/lib/analytics/aggregateTickets";
import type { CategoryDistribution } from "@/hooks/useTicketCategoryStats";
import type { SuggestionStatusDistribution } from "@/hooks/useSuggestionStatusStats";

export type MetricTrend = {
  direction: "up" | "down" | "neutral";
  label: string;
};

export function getVolumeSparkline(series: VolumePoint[] | undefined, maxPoints = 12): number[] {
  if (!series?.length) return [];
  return series.slice(-maxPoints).map((point) => point.count);
}

export function getVolumeTrend(series: VolumePoint[] | undefined): MetricTrend | null {
  if (!series || series.length < 4) return null;

  const recent = series.slice(-2).reduce((sum, point) => sum + point.count, 0);
  const previous = series.slice(-4, -2).reduce((sum, point) => sum + point.count, 0);

  if (previous === 0 && recent === 0) {
    return { direction: "neutral", label: "Stabiel" };
  }

  if (previous === 0) {
    return { direction: "up", label: "Nieuwe activiteit" };
  }

  const change = Math.round(((recent - previous) / previous) * 100);

  if (change > 5) {
    return { direction: "up", label: `+${change}% vs vorige periode` };
  }
  if (change < -5) {
    return { direction: "down", label: `${change}% vs vorige periode` };
  }

  return { direction: "neutral", label: "Stabiel t.o.v. vorige periode" };
}

export function getBusiestWeekday(series: WeekdayPoint[] | undefined): string | null {
  const point = getBusiestWeekdayPoint(series);
  return point?.label ?? null;
}

export function getBusiestWeekdayPoint(
  series: WeekdayPoint[] | undefined
): WeekdayPoint | null {
  if (!series?.length) return null;

  const busiest = series.reduce((best, point) => (point.count > best.count ? point : best));
  return busiest.count > 0 ? busiest : null;
}

export function getTopCategoryLabel(distribution: CategoryDistribution | undefined): string | null {
  return getTopCategoryItem(distribution)?.name ?? null;
}

export function getTopCategoryItem(distribution: CategoryDistribution | undefined) {
  return (
    distribution?.items.find((item) => item.categoryId !== null && item.count > 0) ?? null
  );
}

export function getApprovedSuggestionShare(
  distribution: SuggestionStatusDistribution | undefined
): number | null {
  if (!distribution?.total) return null;
  const approved = distribution.items.find((item) => item.status === "approved")?.count ?? 0;
  return Math.round((approved / distribution.total) * 100);
}

export function getSuggestionStatusSegments(
  distribution: SuggestionStatusDistribution | undefined
) {
  if (!distribution?.total) return [];

  return distribution.items
    .filter((item) => item.count > 0)
    .map((item) => ({
      color: item.color,
      label: item.name,
      percentage: item.percentage,
    }));
}
