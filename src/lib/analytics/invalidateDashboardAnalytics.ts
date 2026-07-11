import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

/** Invalideert alle dashboard-analytics queries (ticket + suggestie per periode). */
export function invalidateDashboardAnalytics(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.stats.ticketAnalyticsRoot });
  void queryClient.invalidateQueries({ queryKey: queryKeys.stats.suggestionStatusRoot });
  void queryClient.invalidateQueries({ queryKey: queryKeys.stats.categoryDistribution });
}
