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
import type { OrganizationPoint } from "@/lib/analytics/aggregateTickets";
import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import type { AnalyticsPeriod } from "@/lib/analytics/period";
import { getTicketsOrganizationFilterUrl } from "@/lib/tickets/filterUrls";

type TopOrganizationsChartProps = {
  data: OrganizationPoint[] | undefined;
  period: AnalyticsPeriod;
  isLoading: boolean;
};

type OrganizationTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: OrganizationPoint }>;
  period: AnalyticsPeriod;
};

function OrganizationTooltip({ active, payload, period }: OrganizationTooltipProps) {
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
      <p className="max-w-xs font-medium text-popover-foreground">{point.name}</p>
      <p className="mt-1 text-xs font-medium text-primary">{formatPeriodDateRange(period, locale)}</p>
      <p className="mt-1 tabular-nums text-muted-foreground">
        {t("analytics.chartTicketsCount", { count: point.count })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t("analytics.orgClickHint")}</p>
    </div>
  );
}

export function TopOrganizationsChart({ data, period, isLoading }: TopOrganizationsChartProps) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const dateRangeLabel = formatPeriodDateRange(period, locale);

  function handleBarClick(point: OrganizationPoint) {
    router.push(getTicketsOrganizationFilterUrl(point.name, period));
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle>{t("analytics.orgTitle")}</CardTitle>
          <ChartPeriodRange period={period} locale={locale} />
        </div>
        <CardDescription>
          {t("analytics.orgDescription", { range: dateRangeLabel.toLowerCase() })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartAreaSkeleton />
        ) : !data?.length ? (
          <p className="text-sm text-muted-foreground">{t("analytics.orgEmpty")}</p>
        ) : (
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip content={<OrganizationTooltip period={period} />} />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
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
