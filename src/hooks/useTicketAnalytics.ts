"use client";

import { useQuery } from "@tanstack/react-query";

import type { CategoryDistribution } from "@/hooks/useTicketCategoryStats";
import {
  buildCategoryDistribution,
  buildTopOrganizations,
  buildVolumeSeries,
  buildWeekdayDistribution,
  filterTicketsByDateRange,
  type OrganizationPoint,
  type VolumePoint,
  type WeekdayPoint,
} from "@/lib/analytics/aggregateTickets";
import {
  getDateRangeForPeriod,
  getVolumeBucketUnit,
  type AnalyticsPeriod,
} from "@/lib/analytics/period";
import { queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";

export type TicketAnalytics = {
  ticketCount: number;
  volumeSeries: VolumePoint[];
  weekdaySeries: WeekdayPoint[];
  topOrganizations: OrganizationPoint[];
  categoryDistribution: CategoryDistribution;
};

export function useTicketAnalytics(period: AnalyticsPeriod) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.stats.ticketAnalytics(period),
    queryFn: async (): Promise<TicketAnalytics> => {
      const range = getDateRangeForPeriod(period);
      const bucketUnit = getVolumeBucketUnit(period);

      const [ticketsResult, categoriesResult] = await Promise.all([
        supabase
          .from("tickets")
          .select("category_id, ticket_created_at, raw_payload"),
        supabase.from("categories").select("id, name, color").order("name"),
      ]);

      if (ticketsResult.error) throw ticketsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      const allTickets = ticketsResult.data ?? [];
      const categories = categoriesResult.data ?? [];
      const filteredTickets = filterTicketsByDateRange(allTickets, range);

      return {
        ticketCount: filteredTickets.length,
        volumeSeries: buildVolumeSeries(filteredTickets, bucketUnit),
        weekdaySeries: buildWeekdayDistribution(filteredTickets),
        topOrganizations: buildTopOrganizations(filteredTickets),
        categoryDistribution: buildCategoryDistribution(filteredTickets, categories),
      };
    },
  });
}
