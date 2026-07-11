"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge, priorityBadgeVariant, statusBadgeVariant } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useCategories } from "@/hooks/useCategories";
import { useLabels } from "@/hooks/useLabels";
import { useTickets } from "@/hooks/useTickets";
import { UNCATEGORIZED_CATEGORY_FILTER } from "@/lib/tickets/constants";
import {
  hasActiveTicketFilters,
  parseTicketFiltersFromSearchParams,
} from "@/lib/tickets/filterUrls";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TicketsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() =>
    parseTicketFiltersFromSearchParams(searchParams)
  );

  useEffect(() => {
    setFilters(parseTicketFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const { data: tickets, isLoading, error } = useTickets(filters);
  const { data: categories } = useCategories();
  const { data: labels } = useLabels();

  const categoryMap = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c.name])),
    [categories]
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground">
          Blader door geïmporteerde supporttickets en filter op status, categorie of label.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Zoeken</Label>
          <Input
            id="search"
            placeholder="Onderwerp…"
            value={filters.search ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
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
            <option value="open">Open</option>
            <option value="pending">In behandeling</option>
            <option value="closed">Gesloten</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categorie</Label>
          <select
            id="category"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={filters.categoryId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))
            }
          >
            <option value="">Alle categorieën</option>
            <option value={UNCATEGORIZED_CATEGORY_FILTER}>Ongecategoriseerd</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <select
            id="label"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={filters.labelId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, labelId: e.target.value || undefined }))
            }
          >
            <option value="">Alle labels</option>
            {(labels ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Tickets laden…</p>
      ) : error ? (
        <p className="text-sm text-destructive">Kon tickets niet laden.</p>
      ) : !tickets?.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          {hasActiveTicketFilters(filters) ? (
            <>
              <p className="font-medium">Geen tickets voor dit filter</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pas de filters aan om andere tickets te bekijken.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setFilters({});
                  router.replace("/dashboard/tickets");
                }}
              >
                Filters wissen
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">Nog geen tickets</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Importeer tickets via het dashboard om te beginnen.
              </p>
              <Link href="/dashboard" className={cn(buttonVariants(), "mt-4")}>
                Naar dashboard
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Onderwerp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioriteit</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Actie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="max-w-xs truncate font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityBadgeVariant(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.category_id ? categoryMap.get(ticket.category_id) ?? "—" : "—"}
                  </TableCell>
                  <TableCell>{formatDate(ticket.ticket_created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Bekijken
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
