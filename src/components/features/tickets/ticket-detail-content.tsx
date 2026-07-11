"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { Badge, priorityBadgeVariant, statusBadgeVariant } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/hooks/useCategories";
import { useLabels } from "@/hooks/useLabels";
import {
  useAddTicketLabel,
  useRemoveTicketLabel,
} from "@/hooks/useTicketLabels";
import { useDeleteTicket, useTicket, useUpdateTicket } from "@/hooks/useTickets";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TicketDetailContent({ ticketId }: { ticketId: string }) {
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
    return <p className="px-4 py-10 text-sm text-muted-foreground">Ticket laden...</p>;
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-destructive">Ticket niet gevonden.</p>
        <Link
          href="/dashboard/tickets"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
        >
          Terug naar overzicht
        </Link>
      </div>
    );
  }

  const ticketLabelIds = new Set(
    ticket.ticket_labels?.map((tl) => tl.label_id) ?? []
  );
  const availableLabels = (labels ?? []).filter((l) => !ticketLabelIds.has(l.id));

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je dit ticket wilt verwijderen?")) return;
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
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard/tickets"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 inline-flex")}
          >
            ← Terug
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
            <Badge variant={priorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteTicket.isPending}>
          Verwijderen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticketgegevens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={ticket.status}
                onChange={(e) =>
                  updateTicket.mutate({ id: ticketId, status: e.target.value })
                }
              >
                <option value="open">Open</option>
                <option value="pending">In behandeling</option>
                <option value="closed">Gesloten</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioriteit</Label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={ticket.priority}
                onChange={(e) =>
                  updateTicket.mutate({ id: ticketId, priority: e.target.value })
                }
              >
                <option value="low">Laag</option>
                <option value="normal">Normaal</option>
                <option value="high">Hoog</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category">Categorie</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={ticket.category_id ?? ""}
                onChange={(e) =>
                  updateTicket.mutate({
                    id: ticketId,
                    category_id: e.target.value || null,
                  })
                }
              >
                <option value="">Geen categorie</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Ontvangen: {formatDate(ticket.ticket_created_at)}</p>
            <p>Kanaal: {ticket.channel ?? "—"}</p>
            <p>Extern ID: {ticket.external_id}</p>
          </div>

          {ticket.body ? (
            <div className="space-y-2">
              <Label>Bericht</Label>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {ticket.body}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Labels</CardTitle>
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
                    aria-label={`Verwijder label ${tl.labels?.name}`}
                  >
                    ×
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Geen labels gekoppeld.</p>
            )}
          </div>

          {availableLabels.length > 0 ? (
            <div className="flex gap-2">
              <select
                className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                value={selectedLabelId}
                onChange={(e) => setSelectedLabelId(e.target.value)}
              >
                <option value="">Label toevoegen...</option>
                {availableLabels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddLabel} disabled={!selectedLabelId || addLabel.isPending}>
                Toevoegen
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
