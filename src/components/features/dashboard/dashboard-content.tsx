"use client";

import Link from "next/link";
import { FolderTree, Sparkles, Tags, Ticket } from "lucide-react";
import { useMemo, useState } from "react";

import {
  buildDashboardInsights,
  DashboardInsights,
} from "@/components/features/dashboard/dashboard-insights";
import { AnalyticsPeriodSelector } from "@/components/features/dashboard/analytics-period-selector";
import { CategoryDistributionChart } from "@/components/features/dashboard/category-distribution-chart";
import { StatMetricCard } from "@/components/features/dashboard/stat-metric-card";
import { TicketVolumeChart } from "@/components/features/dashboard/ticket-volume-chart";
import { TicketWeekdayChart } from "@/components/features/dashboard/ticket-weekday-chart";
import { TopOrganizationsChart } from "@/components/features/dashboard/top-organizations-chart";
import { CategorizeTicketsButton } from "@/components/features/tickets/categorize-tickets-button";
import { ImportTicketsButton } from "@/components/features/tickets/import-tickets-button";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { useSuggestionStatusStats } from "@/hooks/useSuggestionStatusStats";
import { useTicketAnalytics } from "@/hooks/useTicketAnalytics";
import { useDashboardStats } from "@/hooks/useTickets";
import {
  getApprovedSuggestionShare,
  getBusiestWeekdayPoint,
  getSuggestionStatusSegments,
  getTopCategoryItem,
  getVolumeSparkline,
  getVolumeTrend,
} from "@/lib/analytics/dashboard-metrics";
import {
  DEFAULT_ANALYTICS_PERIOD,
  getPeriodLabel,
  type AnalyticsPeriod,
} from "@/lib/analytics/period";
import { getWeekdayFullLabel } from "@/lib/analytics/dateLabels";
import {
  getSuggestionsPeriodFilterUrl,
  getSuggestionsStatusFilterUrl,
  getTicketsCategoryFilterUrl,
  getTicketsOrganizationFilterUrl,
  getTicketsPeriodFilterUrl,
  getTicketsWeekdayFilterUrl,
} from "@/lib/tickets/filterUrls";
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

  const ticketSparkline = useMemo(
    () => getVolumeSparkline(analytics?.volumeSeries),
    [analytics?.volumeSeries]
  );
  const ticketTrend = useMemo(
    () => getVolumeTrend(analytics?.volumeSeries),
    [analytics?.volumeSeries]
  );
  const busiestWeekdayPoint = useMemo(
    () => getBusiestWeekdayPoint(analytics?.weekdaySeries),
    [analytics?.weekdaySeries]
  );
  const topCategoryItem = useMemo(
    () => getTopCategoryItem(analytics?.categoryDistribution),
    [analytics?.categoryDistribution]
  );
  const topCategory = topCategoryItem?.name ?? null;
  const approvedShare = useMemo(
    () => getApprovedSuggestionShare(suggestionStats),
    [suggestionStats]
  );
  const suggestionSegments = useMemo(
    () => getSuggestionStatusSegments(suggestionStats),
    [suggestionStats]
  );
  const topOrganization = analytics?.topOrganizations[0];
  const insights = useMemo(
    () =>
      buildDashboardInsights({
        busiestWeekdayFullLabel: busiestWeekdayPoint
          ? getWeekdayFullLabel(busiestWeekdayPoint.weekday)
          : null,
        busiestWeekdayCount: busiestWeekdayPoint?.count ?? 0,
        topOrganization: topOrganization?.name ?? null,
        topOrganizationCount: topOrganization?.count ?? 0,
        approvedShare,
        periodLabel,
        busiestWeekdayHref: busiestWeekdayPoint
          ? getTicketsWeekdayFilterUrl(busiestWeekdayPoint.weekday, period)
          : undefined,
        topOrganizationHref: topOrganization
          ? getTicketsOrganizationFilterUrl(topOrganization.name, period)
          : undefined,
        approvedHref: getSuggestionsStatusFilterUrl("approved", period),
      }),
    [approvedShare, busiestWeekdayPoint, period, periodLabel, topOrganization]
  );

  const categoriesHref = topCategoryItem
    ? getTicketsCategoryFilterUrl(topCategoryItem.categoryId, period)
    : "/dashboard/instellingen#categories";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Reveal>
        <PageHeader
          eyebrow="Dashboard"
          title="Statistieken"
          description="Bekijk trends in je supporttickets, importeer nieuwe data en spring snel door naar tickets, helpcenter-artikelen of de AI-assistent op Home."
        />
      </Reveal>

      <Reveal delay={80}>
        <AnalyticsPeriodSelector value={period} onChange={setPeriod} />
      </Reveal>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal delay={120} className="h-full">
          <StatMetricCard
            label={`Tickets (${periodLabel.toLowerCase()})`}
            value={analytics?.ticketCount ?? 0}
            icon={Ticket}
            tone="primary"
            isLoading={isAnalyticsLoading}
            sparkline={ticketSparkline}
            trend={ticketTrend}
            href={getTicketsPeriodFilterUrl(period)}
            linkLabel={`Bekijk tickets in ${periodLabel.toLowerCase()}`}
          />
        </Reveal>
        <Reveal delay={200} className="h-full">
          <StatMetricCard
            label="Categorieën"
            value={stats?.categories ?? 0}
            icon={FolderTree}
            tone="teal"
            isLoading={isDashboardStatsLoading}
            hint={
              topCategory ? `Meest voorkomend: ${topCategory}` : "Nog geen categorieën toegewezen"
            }
            href={categoriesHref}
            linkLabel={
              topCategoryItem
                ? `Bekijk tickets in categorie ${topCategory}`
                : "Beheer categorieën"
            }
          />
        </Reveal>
        <Reveal delay={280} className="h-full">
          <StatMetricCard
            label="Labels"
            value={stats?.labels ?? 0}
            icon={Tags}
            tone="amber"
            isLoading={isDashboardStatsLoading}
            hint="Tags voor ticketsegmentatie"
            href="/dashboard/instellingen#labels"
            linkLabel="Beheer labels"
          />
        </Reveal>
        <Reveal delay={360} className="h-full">
          <StatMetricCard
            label={`AI-artikelen (${periodLabel.toLowerCase()})`}
            value={suggestionStats?.total ?? 0}
            icon={Sparkles}
            tone="rose"
            isLoading={isSuggestionStatsLoading}
            segments={suggestionSegments}
            hint={
              approvedShare !== null
                ? `${approvedShare}% goedgekeurd in deze periode`
                : undefined
            }
            href={getSuggestionsPeriodFilterUrl(period)}
            linkLabel={`Bekijk AI-artikelen in ${periodLabel.toLowerCase()}`}
          />
        </Reveal>
      </div>

      <Reveal delay={120}>
        <DashboardInsights insights={insights} isLoading={isAnalyticsLoading} />
      </Reveal>

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
