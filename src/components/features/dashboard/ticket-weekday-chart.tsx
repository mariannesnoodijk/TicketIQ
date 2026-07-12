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
import type { WeekdayPoint } from "@/lib/analytics/aggregateTickets";
import { formatPeriodDateRange, formatWeekdayInPeriod } from "@/lib/analytics/dateLabels";
import { getPeriodLabel, type AnalyticsPeriod } from "@/lib/analytics/period";
import { getTicketsWeekdayFilterUrl } from "@/lib/tickets/filterUrls";

type TicketWeekdayChartProps = {
  data: WeekdayPoint[] | undefined;
  period: AnalyticsPeriod;
  isLoading: boolean;
};

type WeekdayTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: WeekdayPoint }>;
  period: AnalyticsPeriod;
};

function WeekdayTooltip({ active, payload, period }: WeekdayTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-xs font-medium text-primary">{formatWeekdayInPeriod(point.weekday, period)}</p>
      <p className="mt-1 font-medium text-popover-foreground">{point.count} tickets</p>
      <p className="mt-1 text-xs text-muted-foreground">Klik om tickets op deze weekdag te bekijken</p>
    </div>
  );
}

export function TicketWeekdayChart({ data, period, isLoading }: TicketWeekdayChartProps) {
  const router = useRouter();
  const periodLabel = getPeriodLabel(period);

  function handleBarClick(point: WeekdayPoint) {
    if (point.count === 0) {
      return;
    }
    router.push(getTicketsWeekdayFilterUrl(point.weekday, period));
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle>Tickets per weekdag</CardTitle>
          <ChartPeriodRange period={period} />
        </div>
        <CardDescription>
          Drukste dagen binnen {formatPeriodDateRange(period).toLowerCase()}. Filter op weekdag +
          periode bij klik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartAreaSkeleton />
        ) : !data?.some((point) => point.count > 0) ? (
          <p className="text-sm text-muted-foreground">Geen datums beschikbaar in {periodLabel.toLowerCase()}.</p>
        ) : (
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip content={<WeekdayTooltip period={period} />} />
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
