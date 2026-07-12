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
import { useLocale } from "@/components/providers/locale-provider";
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
  const { t, locale } = useLocale();

  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-xs font-medium text-primary">
        {formatWeekdayInPeriod(point.weekday, period, locale)}
      </p>
      <p className="mt-1 font-medium text-popover-foreground">
        {t("analytics.chartTicketsCount", { count: point.count })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t("analytics.weekdayClickHint")}</p>
    </div>
  );
}

export function TicketWeekdayChart({ data, period, isLoading }: TicketWeekdayChartProps) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const periodLabel = getPeriodLabel(period, locale);
  const dateRangeLabel = formatPeriodDateRange(period, locale);

  function handleBarClick(point: WeekdayPoint) {
    if (point.count === 0) {
      return;
    }
    router.push(getTicketsWeekdayFilterUrl(point.weekday, period));
  }

  return (
    <Card id="weekday-chart" className="scroll-mt-24">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle>{t("analytics.weekdayTitle")}</CardTitle>
          <ChartPeriodRange period={period} locale={locale} />
        </div>
        <CardDescription>
          {t("analytics.weekdayDescriptionLong", { range: dateRangeLabel.toLowerCase() })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartAreaSkeleton />
        ) : !data?.some((point) => point.count > 0) ? (
          <p className="text-sm text-muted-foreground">
            {t("analytics.weekdayEmpty", { range: periodLabel.toLowerCase() })}
          </p>
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
