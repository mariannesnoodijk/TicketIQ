"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SuggestionStatusDistribution } from "@/hooks/useSuggestionStatusStats";

type SuggestionStatusChartProps = {
  data: SuggestionStatusDistribution | undefined;
  isLoading: boolean;
};

export function SuggestionStatusChart({ data, isLoading }: SuggestionStatusChartProps) {
  const chartData =
    data?.items
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item.name,
        value: item.count,
        percentage: item.percentage,
        color: item.color,
      })) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggesties per status</CardTitle>
        <CardDescription>
          Verdeling van {isLoading ? "…" : (data?.total ?? 0)} AI-suggesties — goedkeuring en
          workflow in één oogopslag.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Statistieken laden…</p>
        ) : !data?.total ? (
          <p className="text-sm text-muted-foreground">
            Nog geen suggesties. Start een AI-analyse om helpcenter-artikelen te genereren.
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
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const payload = item?.payload as { percentage?: number } | undefined;
                      const percentage = payload?.percentage ?? 0;
                      return [`${value} suggesties (${percentage}%)`, "Aantal"];
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
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
                  <li
                    key={item.status}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
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
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
