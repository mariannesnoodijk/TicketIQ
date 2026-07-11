"use client";

import { useQuery } from "@tanstack/react-query";

import { suggestionStatusLabel } from "@/components/ui/badge";
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

export function useSuggestionStatusStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.stats.suggestionStatusDistribution,
    queryFn: async (): Promise<SuggestionStatusDistribution> => {
      const { data, error } = await supabase.from("ai_suggestions").select("status");

      if (error) throw error;

      const suggestions = data ?? [];
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
          name: suggestionStatusLabel(status),
          color: STATUS_COLORS[status],
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        };
      });

      return { total, items };
    },
  });
}
