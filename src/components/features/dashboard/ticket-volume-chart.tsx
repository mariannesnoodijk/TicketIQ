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
  const { t } = useLocale();

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
      <p className="mt-1 font-medium text-popover-foreground">
        {t("analytics.chartTicketsCount", { count: point.count })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t("analytics.volumeClickHint")}</p>
    </div>
  );
}

export function TicketVolumeChart({
  data,
  period,
  ticketCount,
  isLoading,
}: TicketVolumeChartProps) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const dateRangeLabel = formatPeriodDateRange(period, locale);
  const bucketUnit = getVolumeBucketUnit(period);

  function handleBarClick(point: VolumePoint) {
    router.push(getTicketsVolumeFilterUrl(point.bucketKey, bucketUnit));
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle>{t("analytics.volumeTitle")}</CardTitle>
          <ChartPeriodRange period={period} locale={locale} />
        </div>
        <CardDescription>
          {isLoading
            ? t("common.loading")
            : t("analytics.volumeDescriptionLong", {
                count: ticketCount,
                range: dateRangeLabel.toLowerCase(),
              })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartAreaSkeleton />
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">{t("analytics.volumeEmptyImport")}</p>
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
