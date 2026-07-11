"use client";

import Link from "next/link";

import { CategoryDistributionChart } from "@/components/features/dashboard/category-distribution-chart";
import { SuggestionStatusChart } from "@/components/features/dashboard/suggestion-status-chart";
import { CategorizeTicketsButton } from "@/components/features/tickets/categorize-tickets-button";
import { ImportTicketsButton } from "@/components/features/tickets/import-tickets-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useTicketCategoryStats } from "@/hooks/useTicketCategoryStats";
import { useSuggestionStatusStats } from "@/hooks/useSuggestionStatusStats";
import { useDashboardStats } from "@/hooks/useTickets";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/dashboard/tickets", label: "Tickets bekijken", description: "Overzicht en filters" },
  {
    href: "/dashboard/suggestions",
    label: "Suggesties beheren",
    description: "Bekijk, bewerk en keur AI-artikelen goed",
  },
  {
    href: "/dashboard/analyze",
    label: "AI-analyse starten",
    description: "Detecteer patronen en genereer suggesties",
  },
  {
    href: "/dashboard/categories",
    label: "Categorieën beheren",
    description: "Organiseer tickets per thema",
  },
  { href: "/dashboard/labels", label: "Labels beheren", description: "Tag tickets met labels" },
];

export function DashboardContent({ displayName }: { displayName: string | undefined }) {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: categoryStats, isLoading: isCategoryStatsLoading } = useTicketCategoryStats();
  const { data: suggestionStats, isLoading: isSuggestionStatsLoading } =
    useSuggestionStatusStats();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Dashboard</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {displayName ? `Welkom terug, ${displayName}` : "Welkom terug"}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Op deze pagina kun je je statistieken bekijken, tickets importeren en snel verder met
          AI-analyse, suggesties of het organiseren van categorieën en labels.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tickets", value: stats?.tickets },
          { label: "Categorieën", value: stats?.categories },
          { label: "Labels", value: stats?.labels },
          { label: "AI-suggesties", value: stats?.suggestions },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {isLoading ? "—" : (item.value ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <CategoryDistributionChart data={categoryStats} isLoading={isCategoryStatsLoading} />

      <SuggestionStatusChart data={suggestionStats} isLoading={isSuggestionStatsLoading} />

      {categoryStats?.items.some(
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
