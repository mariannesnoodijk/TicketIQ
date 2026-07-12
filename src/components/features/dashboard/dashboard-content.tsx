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
import { useLocale } from "@/components/providers/locale-provider";
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
import { getWeekdayFullLabel } from "@/lib/analytics/dateLabels";
import {
  DEFAULT_ANALYTICS_PERIOD,
  getPeriodLabel,
  type AnalyticsPeriod,
} from "@/lib/analytics/period";
import {
  getSuggestionsPeriodFilterUrl,
  getSuggestionsStatusFilterUrl,
  getTicketsCategoryFilterUrl,
  getTicketsOrganizationFilterUrl,
  getTicketsPeriodFilterUrl,
  getTicketsWeekdayFilterUrl,
} from "@/lib/tickets/filterUrls";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const { t, locale } = useLocale();
  const [period, setPeriod] = useState<AnalyticsPeriod>(DEFAULT_ANALYTICS_PERIOD);
  const periodLabel = getPeriodLabel(period, locale);

  const quickLinks = useMemo(
    () => [
      {
        href: "/dashboard/home",
        label: t("dashboard.quickAi"),
        description: t("dashboard.quickAiDesc"),
      },
      {
        href: "/dashboard/tickets",
        label: t("dashboard.quickTickets"),
        description: t("dashboard.quickTicketsDesc"),
      },
      {
        href: "/dashboard/suggestions",
        label: t("dashboard.quickSuggestions"),
        description: t("dashboard.quickSuggestionsDesc"),
      },
      {
        href: "/dashboard/instellingen",
        label: t("dashboard.quickSettings"),
        description: t("dashboard.quickSettingsDesc"),
      },
    ],
    [t]
  );

  const { data: stats, isLoading: isDashboardStatsLoading } = useDashboardStats();
  const { data: analytics, isLoading: isAnalyticsLoading } = useTicketAnalytics(period);
  const { data: suggestionStats, isLoading: isSuggestionStatsLoading } =
    useSuggestionStatusStats(period, locale);

  const ticketSparkline = useMemo(
    () => getVolumeSparkline(analytics?.volumeSeries),
    [analytics?.volumeSeries]
  );
  const ticketTrend = useMemo(
    () => getVolumeTrend(analytics?.volumeSeries, locale),
    [analytics?.volumeSeries, locale]
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
      buildDashboardInsights(
        {
          busiestWeekdayFullLabel: busiestWeekdayPoint
            ? getWeekdayFullLabel(busiestWeekdayPoint.weekday, locale)
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
        },
        locale
      ),
    [approvedShare, busiestWeekdayPoint, locale, period, periodLabel, topOrganization]
  );

  const categoriesHref = topCategoryItem
    ? getTicketsCategoryFilterUrl(topCategoryItem.categoryId, period)
    : "/dashboard/instellingen#categories";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Reveal>
        <PageHeader
          eyebrow={t("dashboard.eyebrow")}
          title={t("dashboard.title")}
          description={t("dashboard.description")}
        />
      </Reveal>

      <Reveal delay={80}>
        <AnalyticsPeriodSelector value={period} onChange={setPeriod} />
      </Reveal>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal delay={120} className="h-full">
          <StatMetricCard
            label={t("dashboard.ticketsInPeriod", { period: periodLabel.toLowerCase() })}
            value={analytics?.ticketCount ?? 0}
            icon={Ticket}
            tone="primary"
            isLoading={isAnalyticsLoading}
            sparkline={ticketSparkline}
            trend={ticketTrend}
            href={getTicketsPeriodFilterUrl(period)}
            linkLabel={t("dashboard.viewTicketsInPeriod", {
              period: periodLabel.toLowerCase(),
            })}
          />
        </Reveal>
        <Reveal delay={200} className="h-full">
          <StatMetricCard
            label={t("dashboard.categories")}
            value={stats?.categories ?? 0}
            icon={FolderTree}
            tone="teal"
            isLoading={isDashboardStatsLoading}
            hint={
              topCategory
                ? t("dashboard.mostCommon", { name: topCategory })
                : t("dashboard.noCategoriesAssigned")
            }
            href={categoriesHref}
            linkLabel={
              topCategoryItem
                ? t("dashboard.viewCategoryTickets", { name: topCategory })
                : t("dashboard.manageCategories")
            }
          />
        </Reveal>
        <Reveal delay={280} className="h-full">
          <StatMetricCard
            label={t("dashboard.labels")}
            value={stats?.labels ?? 0}
            icon={Tags}
            tone="amber"
            isLoading={isDashboardStatsLoading}
            hint={t("dashboard.labelsHint")}
            href="/dashboard/instellingen#labels"
            linkLabel={t("dashboard.manageLabels")}
          />
        </Reveal>
        <Reveal delay={360} className="h-full">
          <StatMetricCard
            label={t("dashboard.aiArticlesInPeriod", { period: periodLabel.toLowerCase() })}
            value={suggestionStats?.total ?? 0}
            icon={Sparkles}
            tone="rose"
            isLoading={isSuggestionStatsLoading}
            segments={suggestionSegments}
            hint={
              approvedShare !== null
                ? t("dashboard.approvedShare", { percent: approvedShare })
                : undefined
            }
            href={getSuggestionsPeriodFilterUrl(period)}
            linkLabel={t("dashboard.viewAiArticlesInPeriod", {
              period: periodLabel.toLowerCase(),
            })}
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
            <CardTitle>{t("dashboard.categorizeTitle")}</CardTitle>
            <CardDescription>{t("dashboard.categorizeDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CategorizeTicketsButton />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.importTitle")}</CardTitle>
            <CardDescription>{t("dashboard.importDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ImportTicketsButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
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
