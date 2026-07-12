"use client";

import { useQuery } from "@tanstack/react-query";

import { suggestionStatusLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/types";
import { getDateRangeForPeriod, type AnalyticsPeriod } from "@/lib/analytics/period";
import { queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";
import type { SuggestionStatus } from "@/types";

export type SuggestionStatusDistributionItem = {
  status: SuggestionStatus;
  name: string;
  color: string;
  count: number;
  percentage: number;
};

export type SuggestionStatusDistribution = {
  total: number;
  items: SuggestionStatusDistributionItem[];
};

const STATUS_ORDER: SuggestionStatus[] = ["pending", "approved", "draft", "rejected"];

const STATUS_COLORS: Record<SuggestionStatus, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  draft: "#64748b",
  rejected: "#ef4444",
};

function filterSuggestionsByPeriod(
  suggestions: Array<{ status: string; created_at: string | null }>,
  period: AnalyticsPeriod
) {
  const range = getDateRangeForPeriod(period);

  if (!range.start) {
    return suggestions;
  }

  const startMs = range.start.getTime();
  const endMs = range.end.getTime();

  return suggestions.filter((suggestion) => {
    if (!suggestion.created_at) {
      return false;
    }

    const time = new Date(suggestion.created_at).getTime();
    return time >= startMs && time <= endMs;
  });
}

export function useSuggestionStatusStats(period: AnalyticsPeriod, locale: Locale = "nl") {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.stats.suggestionStatusDistribution(period, locale),
    queryFn: async (): Promise<SuggestionStatusDistribution> => {
      const { data, error } = await supabase.from("ai_suggestions").select("status, created_at");

      if (error) throw error;

      const suggestions = filterSuggestionsByPeriod(data ?? [], period);
      const total = suggestions.length;
      const countByStatus = new Map<SuggestionStatus, number>();

      for (const suggestion of suggestions) {
        const status = suggestion.status as SuggestionStatus;
        countByStatus.set(status, (countByStatus.get(status) ?? 0) + 1);
      }

      const items: SuggestionStatusDistributionItem[] = STATUS_ORDER.map((status) => {
        const count = countByStatus.get(status) ?? 0;
        return {
          status,
          name: suggestionStatusLabel(status, locale),
          color: STATUS_COLORS[status],
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        };
      });

      return { total, items };
    },
  });
}