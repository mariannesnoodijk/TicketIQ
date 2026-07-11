"use client";

import Link from "next/link";

import { ImportTicketsButton } from "@/components/features/tickets/import-tickets-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useTickets";
import { cn } from "@/lib/utils";

const quickLinks = [
  { href: "/dashboard/tickets", label: "Tickets bekijken", description: "Overzicht en filters" },
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

export function DashboardContent({ email }: { email: string | undefined }) {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welkom terug{email ? `, ${email}` : ""}. Importeer tickets, analyseer patronen met AI
          en organiseer ze met categorieën en labels.
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
