"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";

export type CategoryDistributionItem = {
  categoryId: string | null;
  name: string;
  color: string;
  count: number;
  percentage: number;
};

export type CategoryDistribution = {
  total: number;
  items: CategoryDistributionItem[];
};

const UNCATEGORIZED_COLOR = "#94a3b8";

export function useTicketCategoryStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.stats.categoryDistribution,
    queryFn: async (): Promise<CategoryDistribution> => {
      const [ticketsResult, categoriesResult] = await Promise.all([
        supabase.from("tickets").select("category_id"),
        supabase.from("categories").select("id, name, color").order("name"),
      ]);

      if (ticketsResult.error) throw ticketsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      const tickets = ticketsResult.data ?? [];
      const categories = categoriesResult.data ?? [];
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
          name: "Ongecategoriseerd",
          color: UNCATEGORIZED_COLOR,
          count: uncategorizedCount,
          percentage: total > 0 ? Math.round((uncategorizedCount / total) * 100) : 0,
        });
      }

      items.sort((a, b) => b.count - a.count);

      return { total, items };
    },
  });
}
