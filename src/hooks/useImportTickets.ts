"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

type ImportResult = {
  imported: number;
  skipped: number;
  total: number;
};

export function useImportTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ImportResult> => {
      const response = await fetch("/api/tickets/import", { method: "POST" });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Import mislukt");
      }

      return response.json() as Promise<ImportResult>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}
