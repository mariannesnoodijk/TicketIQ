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
import type { CategoryDistribution } from "@/hooks/useTicketCategoryStats";
import { formatPeriodDateRange } from "@/lib/analytics/dateLabels";
import type { AnalyticsPeriod } from "@/lib/analytics/period";
import { getTicketsCategoryFilterUrl } from "@/lib/tickets/filterUrls";

type CategoryDistributionChartProps = {
  data: CategoryDistribution | undefined;
  isLoading: boolean;
  period: AnalyticsPeriod;
};

type ChartSlice = {
  name: string;
  value: number;
  percentage: number;
  color: string;
  categoryId: string | null;
};

type CategoryTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ChartSlice }>;
  period: AnalyticsPeriod;
};

function CategoryTooltip({ active, payload, period }: CategoryTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const slice = payload[0]?.payload as ChartSlice | undefined;
  if (!slice) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{slice.name}</p>
      <p className="mt-1 text-xs font-medium text-primary">{formatPeriodDateRange(period)}</p>
      <p className="mt-1 tabular-nums text-muted-foreground">
        {slice.value} tickets · {slice.percentage}%
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Klik om tickets te bekijken</p>
    </div>
  );
}

export function CategoryDistributionChart({
  data,
  isLoading,
  period,
}: CategoryDistributionChartProps) {
  const router = useRouter();

  const chartData: ChartSlice[] =
    data?.items
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item.name,
        value: item.count,
        percentage: item.percentage,
        color: item.color,
        categoryId: item.categoryId,
      })) ?? [];

  function navigateToCategory(categoryId: string | null) {
    router.push(getTicketsCategoryFilterUrl(categoryId, period));
  }

  function handleSliceClick(slice: ChartSlice) {
    navigateToCategory(slice.categoryId);
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
          <CardTitle>Tickets per categorie</CardTitle>
          <ChartPeriodRange period={period} />
        </div>
        <CardDescription>
          Verdeling van {isLoading ? "…" : (data?.total ?? 0)} tickets binnen{" "}
          {dateRangeLabel.toLowerCase()}. Klik op een categorie in het diagram of de lijst om de
          bijbehorende tickets te openen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PieChartSkeleton />
        ) : !data?.total ? (
          <p className="text-sm text-muted-foreground">
            Nog geen tickets. Importeer eerst tickets om de verdeling te zien.
          </p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tickets gevonden, maar nog geen categorieverdeling beschikbaar.
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
                  <Tooltip content={<CategoryTooltip period={period} />} />
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
                  <li key={item.categoryId ?? "uncategorized"}>
                    <Link
                      href={getTicketsCategoryFilterUrl(item.categoryId, period)}
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
