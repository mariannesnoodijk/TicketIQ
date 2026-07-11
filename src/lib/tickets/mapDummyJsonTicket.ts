import type { DummyJsonTicket } from "@/lib/dummyjson";
import type { TicketInsert } from "@/types";

export type MappedTicket = {
  ticket: Omit<TicketInsert, "user_id">;
  sourceLabel: string | null;
};

/** Zet een DummyJSON-ticket om naar een Supabase tickets-insert. */
export function mapDummyJsonTicket(raw: DummyJsonTicket): MappedTicket {
  const ticketCreatedAt = raw.datum ? new Date(raw.datum.replace(" ", "T")).toISOString() : null;

  return {
    ticket: {
      external_id: raw.ticket_id,
      subject: raw.onderwerp,
      body: raw.body ?? null,
      channel: "email",
      status: "open",
      priority: "normal",
      ticket_created_at: ticketCreatedAt,
      raw_payload: {
        ticket_id: raw.ticket_id,
        datum: raw.datum ?? null,
        afzender_email: raw.afzender_email ?? null,
        afzender_naam: raw.afzender_naam ?? null,
        organisatie_naam: raw.organisatie_naam ?? null,
        onderwerp: raw.onderwerp,
        labels: raw.labels ?? null,
        body: raw.body ?? null,
      },
    },
    sourceLabel: raw.labels?.trim() ? raw.labels.trim() : null,
  };
}

export function mapDummyJsonTickets(rawTickets: DummyJsonTicket[]): MappedTicket[] {
  return rawTickets.map(mapDummyJsonTicket);
}
