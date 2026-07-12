"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AnalyticsPeriodSelector } from "@/components/features/dashboard/analytics-period-selector";
import { PageHeader } from "@/components/layout/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { TableSkeleton } from "@/components/ui/content-skeletons";
import { SuggestionStatusChart } from "@/components/features/suggestions/suggestion-status-chart";
import {
  Badge,
  suggestionStatusBadgeVariant,
  suggestionStatusLabel,
} from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAiSuggestions } from "@/hooks/useAiSuggestions";
import { useSuggestionStatusStats } from "@/hooks/useSuggestionStatusStats";
import { getIntlLocale } from "@/lib/i18n/labels";
import { DEFAULT_ANALYTICS_PERIOD, type AnalyticsPeriod } from "@/lib/analytics/period";
import { parseSuggestionFiltersFromSearchParams } from "@/lib/tickets/filterUrls";
import { cn } from "@/lib/utils";

function formatDate(
  value: string | null,
  locale: ReturnType<typeof useLocale>["locale"]
) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SuggestionsPageContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<AnalyticsPeriod>(DEFAULT_ANALYTICS_PERIOD);

  const [filters, setFilters] = useState(() =>
    parseSuggestionFiltersFromSearchParams(searchParams)
  );

  useEffect(() => {
    setFilters(parseSuggestionFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const { data: suggestions, isLoading, error } = useAiSuggestions(filters);
  const { data: suggestionStats, isLoading: isSuggestionStatsLoading } =
    useSuggestionStatusStats(period, locale);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow={t("suggestions.pageEyebrow")}
        title={t("suggestions.pageTitle")}
        description={t("suggestions.pageDescriptionLong")}
      />

      <AnalyticsPeriodSelector
        value={period}
        onChange={setPeriod}
        description={t("analytics.suggestionsPeriodDescription")}
      />

      <SuggestionStatusChart
        data={suggestionStats}
        isLoading={isSuggestionStatsLoading}
        period={period}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search">{t("suggestions.search")}</Label>
          <Input
            id="search"
            placeholder={t("suggestions.searchPlaceholder")}
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">{t("suggestions.tableStatus")}</Label>
          <Select
            id="status"
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value || undefined }))
            }
          >
            <option value="">{t("suggestions.allStatuses")}</option>
            <option value="pending">{suggestionStatusLabel("pending", locale)}</option>
            <option value="approved">{suggestionStatusLabel("approved", locale)}</option>
            <option value="rejected">{suggestionStatusLabel("rejected", locale)}</option>
            <option value="draft">{suggestionStatusLabel("draft", locale)}</option>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <TableSkeleton rows={6} columns={4} />
        ) : error ? (
          <p className="p-6 text-sm text-destructive">{t("suggestions.loadFailed")}</p>
        ) : !suggestions?.length ? (
          <div className="flex flex-col gap-3 p-6">
            <p className="text-sm text-muted-foreground">{t("suggestions.emptyInPeriod")}</p>
            <Link
              href="/dashboard/home"
              className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
            >
              {t("suggestions.goToAgent")}
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("suggestions.tableTitle")}</TableHead>
                <TableHead>{t("suggestions.tableStatus")}</TableHead>
                <TableHead>{t("suggestions.tableCategory")}</TableHead>
                <TableHead>{t("suggestions.tableCreated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/suggestions/${suggestion.id}`}
                      className="font-medium hover:underline"
                    >
                      {suggestion.title}
                    </Link>
                    {suggestion.summary ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {suggestion.summary}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={suggestionStatusBadgeVariant(suggestion.status)}>
                      {suggestionStatusLabel(suggestion.status, locale)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {suggestion.categories?.name ?? t("common.dash")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(suggestion.created_at, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
