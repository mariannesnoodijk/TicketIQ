"use client";

import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartPeriodRange } from "@/components/features/dashboard/chart-period-range";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartAreaSkeleton } from "@/components/ui/content-skeletons";
import type { VolumePoint } from "@/lib/analytics/aggregateTickets";
import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import { getVolumeBucketUnit, type AnalyticsPeriod } from "@/lib/analytics/period";
import { getTicketsVolumeFilterUrl } from "@/lib/tickets/filterUrls";

type TicketVolumeChartProps = {
  data: VolumePoint[] | undefined;
  period: AnalyticsPeriod;
  ticketCount: number;
  isLoading: boolean;
};

type VolumeTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: VolumePoint }>;
};

function VolumeTooltip({ active, payload }: VolumeTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-xs font-medium text-primary">{point.dateRangeLabel}</p>
      <p className="mt-1 font-medium text-popover-foreground">{point.count} tickets</p>
      <p className="mt-1 text-xs text-muted-foreground">Klik om tickets in dit bereik te bekijken</p>
    </div>
  );
}

export function TicketVolumeChart({
  data,
  period,
  ticketCount,
  isLoading,
}: TicketVolumeChartProps) {
  const router = useRouter();
  const dateRangeLabel = formatPeriodDateRange(period);
  const bucketUnit = getVolumeBucketUnit(period);

  function handleBarClick(point: VolumePoint) {
    router.push(getTicketsVolumeFilterUrl(point.bucketKey, bucketUnit));
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle>Tickets over tijd</CardTitle>
          <ChartPeriodRange period={period} />
        </div>
        <CardDescription>
          {isLoading
            ? "…"
            : `${ticketCount} tickets binnen ${dateRangeLabel.toLowerCase()}. Elke staaf is een datumbereik — klik voor de tickets.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartAreaSkeleton />
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">
            Geen tickets met een datum in deze periode. Pas de periode aan of importeer tickets.
          </p>
        ) : (
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip content={<VolumeTooltip />} />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(_event, index) => {
                    const point = data[index];
                    if (point) {
                      handleBarClick(point);
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
