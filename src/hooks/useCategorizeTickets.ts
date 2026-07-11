"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

type CategorizeResult = {
  categorized: number;
};

export function useCategorizeTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CategorizeResult> => {
      const response = await fetch("/api/tickets/categorize", { method: "POST" });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Categorisatie mislukt");
      }

      return response.json() as Promise<CategorizeResult>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.categoryDistribution });
    },
  });
}
