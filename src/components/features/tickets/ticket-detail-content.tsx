"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { Badge, priorityBadgeVariant, statusBadgeVariant } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { Select } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useLabels } from "@/hooks/useLabels";
import {
  useAddTicketLabel,
  useRemoveTicketLabel,
} from "@/hooks/useTicketLabels";
import { useDeleteTicket, useTicket, useUpdateTicket } from "@/hooks/useTickets";
import { getIntlLocale, ticketPriorityLabel, ticketStatusLabel } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

function formatDate(
  value: string | null,
  locale: ReturnType<typeof useLocale>["locale"]
) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const { data: categories } = useCategories();
  const { data: labels } = useLabels();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const addLabel = useAddTicketLabel();
  const removeLabel = useRemoveTicketLabel();

  const [selectedLabelId, setSelectedLabelId] = useState("");

  if (isLoading) {
    return <p className="px-4 py-10 text-sm text-muted-foreground">{t("tickets.loadingDetail")}</p>;
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-destructive">{t("tickets.notFound")}</p>
        <Link
          href="/dashboard/tickets"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
        >
          {t("common.backToOverview")}
        </Link>
      </div>
    );
  }

  const ticketLabelIds = new Set(
    ticket.ticket_labels?.map((tl) => tl.label_id) ?? []
  );
  const availableLabels = (labels ?? []).filter((l) => !ticketLabelIds.has(l.id));

  async function handleDelete() {
    if (!confirm(t("tickets.deleteConfirm"))) return;
    await deleteTicket.mutateAsync(ticketId);
    router.push("/dashboard/tickets");
  }

  async function handleAddLabel() {
    if (!selectedLabelId) return;
    await addLabel.mutateAsync({ ticketId, labelId: selectedLabelId });
    setSelectedLabelId("");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow={t("tickets.pageEyebrow")}
        title={ticket.subject}
        backHref="/dashboard/tickets"
        backLabel={t("common.backToOverview")}
        size="compact"
        actions={
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTicket.isPending}
          >
            {t("common.delete")}
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2">
        <Badge variant={statusBadgeVariant(ticket.status)}>
          {ticketStatusLabel(ticket.status, locale)}
        </Badge>
        <Badge variant={priorityBadgeVariant(ticket.priority)}>
          {ticketPriorityLabel(ticket.priority, locale)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("tickets.details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">{t("tickets.statusField")}</Label>
              <Select
                id="status"
                value={ticket.status}
                onChange={(e) =>
                  updateTicket.mutate({ id: ticketId, status: e.target.value })
                }
              >
                <option value="open">{ticketStatusLabel("open", locale)}</option>
                <option value="pending">{ticketStatusLabel("pending", locale)}</option>
                <option value="closed">{ticketStatusLabel("closed", locale)}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">{t("tickets.priorityField")}</Label>
              <Select
                id="priority"
                value={ticket.priority}
                onChange={(e) =>
                  updateTicket.mutate({ id: ticketId, priority: e.target.value })
                }
              >
                <option value="low">{ticketPriorityLabel("low", locale)}</option>
                <option value="normal">{ticketPriorityLabel("normal", locale)}</option>
                <option value="high">{ticketPriorityLabel("high", locale)}</option>
                <option value="urgent">{ticketPriorityLabel("urgent", locale)}</option>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category">{t("tickets.category")}</Label>
              <Select
                id="category"
                value={ticket.category_id ?? ""}
                onChange={(e) =>
                  updateTicket.mutate({
                    id: ticketId,
                    category_id: e.target.value || null,
                  })
                }
              >
                <option value="">{t("tickets.noCategory")}</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              {t("tickets.received")} {formatDate(ticket.ticket_created_at, locale)}
            </p>
            <p>
              {t("tickets.channel")} {ticket.channel ?? t("common.dash")}
            </p>
            <p>
              {t("tickets.externalId")} {ticket.external_id}
            </p>
          </div>

          {ticket.body ? (
            <div className="space-y-2">
              <Label>{t("tickets.message")}</Label>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {ticket.body}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("tickets.labels")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ticket.ticket_labels?.length ? (
              ticket.ticket_labels.map((tl) => (
                <Badge key={tl.label_id} variant="outline" className="gap-2">
                  {tl.labels?.name}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      removeLabel.mutate({ ticketId, labelId: tl.label_id })
                    }
                    aria-label={t("tickets.removeLabel", { name: tl.labels?.name ?? "" })}
                  >
                    ×
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("tickets.noLabels")}</p>
            )}
          </div>

          {availableLabels.length > 0 ? (
            <div className="flex gap-2">
              <Select
                className="flex-1"
                value={selectedLabelId}
                onChange={(e) => setSelectedLabelId(e.target.value)}
              >
                <option value="">{t("tickets.addLabel")}</option>
                {availableLabels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
              <Button onClick={handleAddLabel} disabled={!selectedLabelId || addLabel.isPending}>
                {t("common.add")}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TicketDetailContent ticketId={id} />;
}
