"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ChartPeriodRange } from "@/components/features/dashboard/chart-period-range";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChartSkeleton } from "@/components/ui/content-skeletons";
import type { SuggestionStatusDistribution } from "@/hooks/useSuggestionStatusStats";
import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import type { AnalyticsPeriod } from "@/lib/analytics/period";
import { getSuggestionsStatusFilterUrl } from "@/lib/tickets/filterUrls";
import type { SuggestionStatus } from "@/types";

type SuggestionStatusChartProps = {
  data: SuggestionStatusDistribution | undefined;
  isLoading: boolean;
  period: AnalyticsPeriod;
};

type ChartSlice = {
  name: string;
  value: number;
  percentage: number;
  color: string;
  status: SuggestionStatus;
};

type SuggestionTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ChartSlice }>;
  period: AnalyticsPeriod;
};

function SuggestionTooltip({ active, payload, period }: SuggestionTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const slice = payload[0]?.payload;
  if (!slice) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{slice.name}</p>
      <p className="mt-1 text-xs font-medium text-primary">{formatPeriodDateRange(period)}</p>
      <p className="mt-1 tabular-nums text-muted-foreground">
        {slice.value} AI-helpcenter-artikelen · {slice.percentage}%
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Klik om artikelen met deze status te bekijken</p>
    </div>
  );
}

export function SuggestionStatusChart({
  data,
  isLoading,
  period,
}: SuggestionStatusChartProps) {
  const router = useRouter();

  const chartData: ChartSlice[] =
    data?.items
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item.name,
        value: item.count,
        percentage: item.percentage,
        color: item.color,
        status: item.status,
      })) ?? [];

  function handleSliceClick(slice: ChartSlice) {
    router.push(getSuggestionsStatusFilterUrl(slice.status, period));
  }

  function handleLegendClick(entry: { value?: string }) {
    const slice = chartData.find((item) => item.name === entry.value);
    if (slice) {
      handleSliceClick(slice);
    }
  }

  const dateRangeLabel = formatPeriodDateRange(period);

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle>AI-helpcenter-artikelen per status</CardTitle>
          <ChartPeriodRange period={period} />
        </div>
        <CardDescription>
          Verdeling van {isLoading ? "…" : (data?.total ?? 0)} door AI voorgestelde
          helpcenter-artikelen binnen {dateRangeLabel.toLowerCase()}. Klik op een status om de
          bijbehorende artikelen in de lijst hieronder te filteren.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PieChartSkeleton />
        ) : !data?.total ? (
          <p className="text-sm text-muted-foreground">
            Nog geen AI-helpcenter-artikelen in deze periode. Pas de periode aan of start een
            AI-analyse.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    cursor="pointer"
                    onClick={(_event, index) => {
                      const slice = chartData[index];
                      if (slice) {
                        handleSliceClick(slice);
                      }
                    }}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<SuggestionTooltip period={period} />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    className="cursor-pointer"
                    onClick={handleLegendClick}
                    formatter={(value) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="flex flex-col gap-2">
              {data.items
                .filter((item) => item.count > 0)
                .map((item) => (
                  <li key={item.status}>
                    <Link
                      href={getSuggestionsStatusFilterUrl(item.status, period)}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent/50"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                          aria-hidden
                        />
                        <span className="truncate font-medium">{item.name}</span>
                      </div>
                      <div className="shrink-0 tabular-nums text-muted-foreground">
                        {item.count}{" "}
                        <span className="text-foreground">({item.percentage}%)</span>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
