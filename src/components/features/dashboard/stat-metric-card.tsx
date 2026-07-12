"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/ui/sparkline";
import { cn } from "@/lib/utils";
import type { MetricTrend } from "@/lib/analytics/dashboard-metrics";

type StatMetricTone = "primary" | "teal" | "amber" | "rose";

const toneStyles: Record<
  StatMetricTone,
  { stripe: string; icon: string; spark: string }
> = {
  primary: {
    stripe: "from-primary via-brand-fuchsia to-brand-cyan",
    icon: "bg-primary/12 text-primary",
    spark: "stroke-primary",
  },
  teal: {
    stripe: "from-teal-500 via-emerald-400 to-cyan-400",
    icon: "bg-teal-500/12 text-teal-600 dark:text-teal-300",
    spark: "stroke-teal-500",
  },
  amber: {
    stripe: "from-amber-500 via-orange-400 to-rose-400",
    icon: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    spark: "stroke-amber-500",
  },
  rose: {
    stripe: "from-rose-500 via-fuchsia-500 to-violet-500",
    icon: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    spark: "stroke-rose-500",
  },
};

type StatusSegment = {
  color: string;
  label: string;
  percentage: number;
};

type StatMetricCardProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: StatMetricTone;
  isLoading?: boolean;
  sparkline?: number[];
  trend?: MetricTrend | null;
  hint?: string | null;
  segments?: StatusSegment[];
  href?: string;
  linkLabel?: string;
  className?: string;
};

function TrendBadge({ trend }: { trend: MetricTrend }) {
  const icon =
    trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        trend.direction === "up" && "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
        trend.direction === "down" && "bg-rose-500/12 text-rose-700 dark:text-rose-300",
        trend.direction === "neutral" && "bg-muted text-muted-foreground"
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {trend.label}
    </span>
  );
}

export function StatMetricCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  isLoading = false,
  sparkline,
  trend,
  hint,
  segments,
  href,
  linkLabel,
  className,
}: StatMetricCardProps) {
  const t = useTranslations();
  const styles = toneStyles[tone];
  const hasSparkline = Boolean(sparkline && sparkline.length > 1);
  const hasSegments = Boolean(segments && segments.length > 0);

  const card = (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden transition-all",
        href &&
          "group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-md group-hover:shadow-primary/10"
      )}
    >
      <div
        className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", styles.stripe)}
        aria-hidden="true"
      />
      <CardHeader className="flex shrink-0 flex-row items-start justify-between gap-3 space-y-0 pb-1.5 pt-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="text-3xl font-bold tabular-nums tracking-tight">
            {isLoading ? <Skeleton className="h-9 w-20" /> : value}
          </div>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            styles.icon
          )}
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pb-4 pt-0">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {hasSparkline || hasSegments ? (
            <div className={cn("flex shrink-0 items-end", hasSparkline ? "h-8" : "h-2")}>
              {hasSparkline ? (
                <Sparkline values={sparkline!} className={styles.spark} height={32} />
              ) : (
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  {segments!.map((segment) => (
                    <div
                      key={segment.label}
                      className="h-full transition-all"
                      style={{
                        width: `${segment.percentage}%`,
                        backgroundColor: segment.color,
                      }}
                      title={`${segment.label}: ${segment.percentage}%`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="space-y-1.5">
            {hasSegments ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {segments!.map((segment) => (
                  <span key={segment.label} className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: segment.color }}
                      aria-hidden="true"
                    />
                    {segment.label} {segment.percentage}%
                  </span>
                ))}
              </div>
            ) : null}

            {trend ? <TrendBadge trend={trend} /> : null}

            {hint ? <p className="text-xs leading-snug text-muted-foreground">{hint}</p> : null}
          </div>
        </div>

        {href ? (
          <p className="mt-2 shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {t("common.viewArrow")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  const wrapperClass = cn("h-full", className);

  if (!href) {
    return <div className={wrapperClass}>{card}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        wrapperClass
      )}
      aria-label={linkLabel ?? t("common.viewLabel", { label })}
    >
      {card}
    </Link>
  );
}
