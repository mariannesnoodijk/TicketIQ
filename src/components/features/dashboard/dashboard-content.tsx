"use client";

import Link from "next/link";
import { useState } from "react";

import { AnalyticsPeriodSelector } from "@/components/features/dashboard/analytics-period-selector";
import { CategoryDistributionChart } from "@/components/features/dashboard/category-distribution-chart";
import { TicketVolumeChart } from "@/components/features/dashboard/ticket-volume-chart";
import { TicketWeekdayChart } from "@/components/features/dashboard/ticket-weekday-chart";
import { TopOrganizationsChart } from "@/components/features/dashboard/top-organizations-chart";
import { CategorizeTicketsButton } from "@/components/features/tickets/categorize-tickets-button";
import { ImportTicketsButton } from "@/components/features/tickets/import-tickets-button";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuggestionStatusStats } from "@/hooks/useSuggestionStatusStats";
import { useTicketAnalytics } from "@/hooks/useTicketAnalytics";
import { useDashboardStats } from "@/hooks/useTickets";
import {
  DEFAULT_ANALYTICS_PERIOD,
  getPeriodLabel,
  type AnalyticsPeriod,
} from "@/lib/analytics/period";
import { cn } from "@/lib/utils";

const quickLinks = [
  {
    href: "/dashboard/home",
    label: "Naar AI-assistent",
    description: "Tickets analyseren en helpcenter-artikelen laten genereren",
  },
  { href: "/dashboard/tickets", label: "Tickets bekijken", description: "Overzicht en filters" },
  {
    href: "/dashboard/suggestions",
    label: "Helpcenter-artikelen",
    description: "AI-voorstellen bekijken, bewerken en goedkeuren",
  },
  {
    href: "/dashboard/instellingen",
    label: "Instellingen",
    description: "Categorieën en labels beheren",
  },
];

export function DashboardContent() {
  const [period, setPeriod] = useState<AnalyticsPeriod>(DEFAULT_ANALYTICS_PERIOD);
  const periodLabel = getPeriodLabel(period);

  const { data: stats, isLoading: isDashboardStatsLoading } = useDashboardStats();
  const { data: analytics, isLoading: isAnalyticsLoading } = useTicketAnalytics(period);
  const { data: suggestionStats, isLoading: isSuggestionStatsLoading } =
    useSuggestionStatusStats(period);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Statistieken"
        description="Bekijk trends in je supporttickets, importeer nieuwe data en spring snel door naar tickets, helpcenter-artikelen of de AI-assistent op Home."
      />

      <AnalyticsPeriodSelector value={period} onChange={setPeriod} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tickets ({periodLabel.toLowerCase()})</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {isAnalyticsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                (analytics?.ticketCount ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        {[
          { label: "Categorieën", value: stats?.categories },
          { label: "Labels", value: stats?.labels },
          { label: "AI-helpcenter-artikelen", value: suggestionStats?.total },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>
                {item.label}
                {item.label === "AI-helpcenter-artikelen" ? ` (${periodLabel.toLowerCase()})` : ""}
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {isDashboardStatsLoading ||
                (item.label === "AI-helpcenter-artikelen" && isSuggestionStatsLoading) ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  (item.value ?? 0)
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <TicketVolumeChart
        data={analytics?.volumeSeries}
        period={period}
        ticketCount={analytics?.ticketCount ?? 0}
        isLoading={isAnalyticsLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TicketWeekdayChart
          data={analytics?.weekdaySeries}
          period={period}
          isLoading={isAnalyticsLoading}
        />
        <TopOrganizationsChart
          data={analytics?.topOrganizations}
          period={period}
          isLoading={isAnalyticsLoading}
        />
      </div>

      <CategoryDistributionChart
        data={analytics?.categoryDistribution}
        isLoading={isAnalyticsLoading}
        period={period}
      />

      {analytics?.categoryDistribution.items.some(
        (item) => item.categoryId === null && item.count > 0
      ) ? (
        <Card>
          <CardHeader>
            <CardTitle>Tickets categoriseren</CardTitle>
            <CardDescription>
              Tickets die vóór de automatische categorisatie zijn geïmporteerd, krijgen pas een
              categorie na onderstaande actie (of opnieuw importeren).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategorizeTicketsButton />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket-import</CardTitle>
            <CardDescription>
              Haal ~500 supporttickets op uit de DummyJSON Custom Response API. Bestaande tickets
              worden overgeslagen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportTicketsButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snelle acties</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-auto flex-col items-start gap-1 px-4 py-3"
                )}
              >
                <span className="font-medium">{link.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {link.description}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
