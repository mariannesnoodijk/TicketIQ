"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateDashboardAnalytics } from "@/lib/analytics/invalidateDashboardAnalytics";
import { parseFetchJson } from "@/lib/fetch-json";
import { queryKeys } from "@/lib/queryKeys";

type ImportResult = {
  imported: number;
  skipped: number;
  backfilled?: number;
  total: number;
};

export function useImportTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ImportResult> => {
      const response = await fetch("/api/tickets/import", { method: "POST" });
      const body = await parseFetchJson<ImportResult & { error?: string }>(response);

      if (!response.ok) {
        throw new Error(body.error ?? "Import mislukt");
      }

      return body;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      invalidateDashboardAnalytics(queryClient);
    },
  });
}
