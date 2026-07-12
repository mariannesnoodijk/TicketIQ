"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { TableSkeleton } from "@/components/ui/content-skeletons";
import { Badge, priorityBadgeVariant, statusBadgeVariant } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useCategories } from "@/hooks/useCategories";
import { useLabels } from "@/hooks/useLabels";
import { useTickets } from "@/hooks/useTickets";
import { getIntlLocale, ticketPriorityLabel, ticketStatusLabel } from "@/lib/i18n/labels";
import { UNCATEGORIZED_CATEGORY_FILTER } from "@/lib/tickets/constants";
import {
  DEFAULT_TICKET_DISPLAY_LIMIT,
  getNextTicketLimit,
  getTicketLimitLabel,
  getVisibleTicketCount,
  type TicketDisplayLimit,
} from "@/lib/tickets/limits";
import {
  hasActiveTicketFilters,
  parseTicketFiltersFromSearchParams,
} from "@/lib/tickets/filterUrls";
import { cn } from "@/lib/utils";

function formatDate(value: string | null, locale: ReturnType<typeof useLocale>["locale"]) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TicketsPageContent() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() =>
    parseTicketFiltersFromSearchParams(searchParams)
  );
  const [displayLimit, setDisplayLimit] = useState<TicketDisplayLimit>(
    DEFAULT_TICKET_DISPLAY_LIMIT
  );

  useEffect(() => {
    setFilters(parseTicketFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    setDisplayLimit(DEFAULT_TICKET_DISPLAY_LIMIT);
  }, [filterKey]);

  const { data: tickets, isLoading, error } = useTickets(filters);
  const { data: categories } = useCategories();
  const { data: labels } = useLabels();

  const categoryMap = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c.name])),
    [categories]
  );

  const totalCount = tickets?.length ?? 0;
  const visibleCount = getVisibleTicketCount(displayLimit, totalCount);
  const visibleTickets = tickets?.slice(0, visibleCount) ?? [];
  const nextLimit = getNextTicketLimit(displayLimit);
  const canShowMore = nextLimit !== null && visibleCount < totalCount;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow={t("tickets.pageEyebrow")}
        title={t("tickets.pageTitle")}
        description={t("tickets.pageDescription")}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">{t("tickets.search")}</Label>
          <Input
            id="search"
            placeholder={t("tickets.searchPlaceholder")}
            value={filters.search ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">{t("tickets.statusField")}</Label>
          <Select
            id="status"
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value || undefined }))
            }
          >
            <option value="">{t("tickets.allStatuses")}</option>
            <option value="open">{ticketStatusLabel("open", locale)}</option>
            <option value="pending">{ticketStatusLabel("pending", locale)}</option>
            <option value="closed">{ticketStatusLabel("closed", locale)}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">{t("tickets.category")}</Label>
          <Select
            id="category"
            value={filters.categoryId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))
            }
          >
            <option value="">{t("tickets.allCategories")}</option>
            <option value={UNCATEGORIZED_CATEGORY_FILTER}>{t("common.uncategorized")}</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="label">{t("tickets.labelField")}</Label>
          <Select
            id="label"
            value={filters.labelId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, labelId: e.target.value || undefined }))
            }
          >
            <option value="">{t("tickets.allLabels")}</option>
            {(labels ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : error ? (
        <p className="text-sm text-destructive">{t("tickets.loadFailed")}</p>
      ) : !tickets?.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          {hasActiveTicketFilters(filters) ? (
            <>
              <p className="font-medium">{t("tickets.emptyFilterTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("tickets.emptyFilterDescription")}
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
                {t("common.clearFilters")}
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">{t("tickets.emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("tickets.emptyDescription")}</p>
              <Link href="/dashboard" className={cn(buttonVariants(), "mt-4")}>
                {t("common.goToDashboard")}
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("tickets.tableSubject")}</TableHead>
                <TableHead>{t("tickets.tableStatus")}</TableHead>
                <TableHead>{t("tickets.tablePriority")}</TableHead>
                <TableHead>{t("tickets.tableCategory")}</TableHead>
                <TableHead>{t("tickets.tableDate")}</TableHead>
                <TableHead className="text-right">{t("tickets.tableAction")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="max-w-xs truncate font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(ticket.status)}>
                      {ticketStatusLabel(ticket.status, locale)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityBadgeVariant(ticket.priority)}>
                      {ticketPriorityLabel(ticket.priority, locale)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.category_id
                      ? (categoryMap.get(ticket.category_id) ?? t("common.dash"))
                      : t("common.dash")}
                  </TableCell>
                  <TableCell>{formatDate(ticket.ticket_created_at, locale)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      {t("common.view")}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t("tickets.visibleOfTotal", { visible: visibleCount, total: totalCount })}
            </p>
            {canShowMore && nextLimit ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDisplayLimit(nextLimit)}
              >
                {`${t("tickets.showMoreButton")} — ${getTicketLimitLabel(nextLimit, totalCount, locale)}`}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
