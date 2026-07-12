"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateDashboardAnalytics } from "@/lib/analytics/invalidateDashboardAnalytics";
import { parseFetchJson } from "@/lib/fetch-json";
import { queryKeys } from "@/lib/queryKeys";

type CategorizeResult = {
  categorized: number;
};

export function useCategorizeTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CategorizeResult> => {
      const response = await fetch("/api/tickets/categorize", { method: "POST" });
      const body = await parseFetchJson<CategorizeResult & { error?: string }>(response);

      if (!response.ok) {
        throw new Error(body.error ?? "Categorisatie mislukt");
      }

      return body;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      invalidateDashboardAnalytics(queryClient);
    },
  });
}
