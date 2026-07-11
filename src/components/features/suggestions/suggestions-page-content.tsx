"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AnalyticsPeriodSelector } from "@/components/features/dashboard/analytics-period-selector";
import { SuggestionStatusChart } from "@/components/features/suggestions/suggestion-status-chart";
import {
  Badge,
  suggestionStatusBadgeVariant,
  suggestionStatusLabel,
} from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DEFAULT_ANALYTICS_PERIOD, type AnalyticsPeriod } from "@/lib/analytics/period";
import { parseSuggestionFiltersFromSearchParams } from "@/lib/tickets/filterUrls";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SuggestionsPageContent() {
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
    useSuggestionStatusStats(period);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">AI-helpcenter-artikelen</h1>
        <p className="text-muted-foreground">
          Bekijk en beheer helpcenter-artikelen die de AI op basis van je supporttickets heeft
          voorgesteld. Open een artikel om te bewerken of goed te keuren.
        </p>
      </div>

      <AnalyticsPeriodSelector
        value={period}
        onChange={setPeriod}
        description="Bepaal het datumbereik voor de verdeling van AI-voorgestelde helpcenter-artikelen hieronder."
      />

      <SuggestionStatusChart
        data={suggestionStats}
        isLoading={isSuggestionStatsLoading}
        period={period}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search">Zoeken</Label>
          <Input
            id="search"
            placeholder="Titel..."
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value || undefined }))
            }
          >
            <option value="">Alle statussen</option>
            <option value="pending">In afwachting</option>
            <option value="approved">Goedgekeurd</option>
            <option value="rejected">Afgewezen</option>
            <option value="draft">Concept</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Artikelen laden…</p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">Kon helpcenter-artikelen niet laden.</p>
        ) : !suggestions?.length ? (
          <div className="flex flex-col gap-3 p-6">
            <p className="text-sm text-muted-foreground">
              Nog geen AI-helpcenter-artikelen. Start een AI-analyse om artikelen te laten
              genereren op basis van je tickets.
            </p>
            <Link
              href="/dashboard/analyze"
              className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
            >
              Naar AI-analyse
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Aangemaakt</TableHead>
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
                      {suggestionStatusLabel(suggestion.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {suggestion.categories?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(suggestion.created_at)}
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
