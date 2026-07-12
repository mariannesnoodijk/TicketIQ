"use client";

import { Building2, CalendarDays, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type DashboardInsight = {
  label: string;
  value: string;
  detail?: string;
  icon: typeof CalendarDays;
  tone: string;
  href?: string;
  linkLabel?: string;
};

type DashboardInsightsProps = {
  insights: DashboardInsight[];
  isLoading?: boolean;
  className?: string;
};

export function DashboardInsights({ insights, isLoading, className }: DashboardInsightsProps) {
  return (
    <div className={cn("grid items-stretch gap-4 sm:grid-cols-3", className)}>
      {insights.map((insight) => {
        const card = (
          <Card
            className={cn(
              "flex h-full min-h-[8.5rem] flex-col overflow-hidden transition-all",
              insight.href &&
                "group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-md group-hover:shadow-primary/10"
            )}
          >
            <CardHeader className="flex shrink-0 flex-row items-center gap-3 space-y-0 pb-2">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  insight.tone
                )}
                aria-hidden="true"
              >
                <insight.icon className="size-4" />
              </span>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {insight.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pb-4 pt-0">
              <div className="min-h-0 flex-1">
                {isLoading ? (
                  <Skeleton className="h-7 w-32" />
                ) : (
                  <>
                    <p className="text-lg font-semibold tracking-tight">{insight.value}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {insight.detail ?? "\u00A0"}
                    </p>
                  </>
                )}
              </div>
              {insight.href ? (
                <p className="mt-2 shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Bekijken →
                </p>
              ) : null}
            </CardContent>
          </Card>
        );

        if (!insight.href) {
          return (
            <div key={insight.label} className="h-full">
              {card}
            </div>
          );
        }

        return (
          <Link
            key={insight.label}
            href={insight.href}
            className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={insight.linkLabel ?? `Bekijk ${insight.label}`}
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}

function formatTicketCount(count: number): string {
  return count === 1 ? "1 ticket" : `${count} tickets`;
}

export function buildDashboardInsights(input: {
  busiestWeekdayFullLabel: string | null;
  busiestWeekdayCount: number;
  topOrganization: string | null;
  topOrganizationCount: number;
  approvedShare: number | null;
  periodLabel: string;
  busiestWeekdayHref?: string;
  topOrganizationHref?: string;
  approvedHref?: string;
}): DashboardInsight[] {
  return [
    {
      label: "Drukste dag",
      value: input.busiestWeekdayFullLabel ?? "—",
      detail: input.busiestWeekdayFullLabel
        ? `${formatTicketCount(input.busiestWeekdayCount)} · meeste in ${input.periodLabel.toLowerCase()}`
        : "Nog geen ticketdata",
      icon: CalendarDays,
      tone: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
      href: input.busiestWeekdayFullLabel ? input.busiestWeekdayHref : undefined,
      linkLabel: input.busiestWeekdayFullLabel
        ? `Bekijk tickets op ${input.busiestWeekdayFullLabel.toLowerCase()}`
        : undefined,
    },
    {
      label: "Top organisatie",
      value: input.topOrganization ?? "—",
      detail:
        input.topOrganization && input.topOrganizationCount > 0
          ? `${input.topOrganizationCount} tickets`
          : "Nog geen organisaties",
      icon: Building2,
      tone: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
      href: input.topOrganization ? input.topOrganizationHref : undefined,
      linkLabel: input.topOrganization
        ? `Bekijk tickets van ${input.topOrganization}`
        : undefined,
    },
    {
      label: "Goedgekeurd",
      value: input.approvedShare !== null ? `${input.approvedShare}%` : "—",
      detail: "Van alle AI-helpcenter-artikelen",
      icon: TrendingUp,
      tone: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
      href: input.approvedShare !== null ? input.approvedHref : undefined,
      linkLabel: "Bekijk goedgekeurde AI-artikelen",
    },
  ];
}
