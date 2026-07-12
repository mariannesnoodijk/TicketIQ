import { tool } from "ai";
import { z } from "zod";

import { AI_LIMITS, truncateForPrompt } from "@/lib/ai/limits";
import type { FetchTicketsResult, FetchedTicketSummary } from "@/lib/ai/types";
import { fetchDummyJsonTickets, type DummyJsonTicket } from "@/lib/dummyjson";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_BODY_LENGTH = AI_LIMITS.maxTicketBodyChars;
const MAX_LIMIT = AI_LIMITS.maxTicketsPerFetch;

const fetchTicketsInputSchema = z.object({
  source: z
    .enum(["database", "api"])
    .default("database")
    .describe(
      'Bron: "database" voor geïmporteerde tickets (standaard analyse), "api" voor live DummyJSON Custom Response API'
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .default(50)
    .describe(`Aantal meest recente tickets (max ${MAX_LIMIT}). Negeer bij fetchAll.`),
  fetchAll: z
    .boolean()
    .default(false)
    .describe(
      `True om tickets op te halen (max ${MAX_LIMIT} tickets, ook bij fetchAll)`
    ),
  search: z
    .string()
    .optional()
    .describe("Optioneel zoekfilter op onderwerp of berichttekst"),
  label: z.string().optional().describe("Optioneel filter op bronslabel"),
});

type FetchTicketsInput = z.infer<typeof fetchTicketsInputSchema>;

type TicketRow = {
  external_id: string;
  subject: string;
  body: string | null;
  ticket_created_at: string | null;
  raw_payload: unknown;
};

function truncateBody(body: string | null): string | null {
  if (!body) {
    return null;
  }

  return body.length > MAX_BODY_LENGTH
    ? truncateForPrompt(body, MAX_BODY_LENGTH)
    : body;
}

function getRawString(raw: unknown, key: string): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const value = (raw as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function mapTicketRowToSummary(ticket: TicketRow): FetchedTicketSummary {
  return {
    externalId: ticket.external_id,
    subject: ticket.subject,
    body: truncateBody(ticket.body),
    label: getRawString(ticket.raw_payload, "labels"),
    date: ticket.ticket_created_at,
    sender: getRawString(ticket.raw_payload, "afzender_naam"),
    organization: getRawString(ticket.raw_payload, "organisatie_naam"),
  };
}

function mapDummyJsonTicketToSummary(ticket: DummyJsonTicket): FetchedTicketSummary {
  return {
    externalId: String(ticket.ticket_id),
    subject: ticket.onderwerp,
    body: truncateBody(ticket.body ?? null),
    label: ticket.labels?.trim() ? ticket.labels.trim() : null,
    date: ticket.datum ?? null,
    sender: ticket.afzender_naam ?? null,
    organization: ticket.organisatie_naam ?? null,
  };
}

function filterDummyJsonByLabel(tickets: DummyJsonTicket[], label: string): DummyJsonTicket[] {
  const labelQuery = label.toLowerCase();
  return tickets.filter((ticket) =>
    (ticket.labels ?? "").toLowerCase().includes(labelQuery)
  );
}

function filterTicketsByLabel(tickets: TicketRow[], label: string): TicketRow[] {
  const labelQuery = label.toLowerCase();
  return tickets.filter((ticket) =>
    getRawString(ticket.raw_payload, "labels")?.toLowerCase().includes(labelQuery)
  );
}

function sortSummariesByDateDesc(tickets: FetchedTicketSummary[]): FetchedTicketSummary[] {
  return tickets.toSorted((left, right) => {
    const leftTime = left.date ? Date.parse(left.date) : 0;
    const rightTime = right.date ? Date.parse(right.date) : 0;
    return rightTime - leftTime;
  });
}

function applyLimit(
  tickets: FetchedTicketSummary[],
  fetchAll: boolean,
  limit: number
): FetchedTicketSummary[] {
  const effectiveLimit = fetchAll
    ? MAX_LIMIT
    : Math.min(limit, MAX_LIMIT);

  return tickets.slice(0, effectiveLimit);
}

async function fetchTicketsFromDatabase(
  supabase: SupabaseServerClient,
  userId: string,
  { limit, fetchAll, search, label }: FetchTicketsInput
): Promise<FetchTicketsResult> {
  const { count: totalCount, error: countError } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    return {
      source: "database",
      count: 0,
      totalAvailable: 0,
      tickets: [],
      error: countError.message,
    };
  }

  let query = supabase
    .from("tickets")
    .select("external_id, subject, body, ticket_created_at, raw_payload")
    .eq("user_id", userId)
    .order("ticket_created_at", { ascending: false, nullsFirst: false })
    .order("imported_at", { ascending: false });

  if (search?.trim()) {
    const term = search.trim();
    query = query.or(`subject.ilike.%${term}%,body.ilike.%${term}%`);
  }

  if (!fetchAll) {
    query = query.limit(label?.trim() ? MAX_LIMIT : limit);
  }

  const { data, error } = await query;

  if (error) {
    return {
      source: "database",
      count: 0,
      totalAvailable: totalCount ?? 0,
      tickets: [],
      error: error.message,
    };
  }

  let rows = (data ?? []) as TicketRow[];

  if (label?.trim()) {
    rows = filterTicketsByLabel(rows, label);
  }

  const tickets = applyLimit(rows.map(mapTicketRowToSummary), fetchAll, limit);

  return {
    source: "database",
    count: tickets.length,
    totalAvailable: totalCount ?? 0,
    tickets,
  };
}

async function fetchTicketsFromApi({
  limit,
  fetchAll,
  search,
  label,
}: FetchTicketsInput): Promise<FetchTicketsResult> {
  const all = await fetchDummyJsonTickets();
  let filtered = all;

  if (search?.trim()) {
    const query = search.trim().toLowerCase();
    filtered = filtered.filter(
      (ticket) =>
        ticket.onderwerp.toLowerCase().includes(query) ||
        (ticket.body?.toLowerCase().includes(query) ?? false)
    );
  }

  if (label?.trim()) {
    filtered = filterDummyJsonByLabel(filtered, label);
  }

  const sorted = sortSummariesByDateDesc(filtered.map(mapDummyJsonTicketToSummary));
  const tickets = applyLimit(sorted, fetchAll, limit);

  return {
    source: "api",
    count: tickets.length,
    totalAvailable: all.length,
    tickets,
  };
}

export function createFetchTicketsTool(supabase: SupabaseServerClient, userId: string) {
  return tool({
    description:
      "Haalt supporttickets op voor analyse. Standaard uit de database van de ingelogde gebruiker (geïmporteerde tickets). Met source: api haalt de tool live data op uit de DummyJSON Custom Response API.",
    inputSchema: fetchTicketsInputSchema,
    execute: async (input): Promise<FetchTicketsResult> => {
      try {
        if (input.source === "api") {
          return await fetchTicketsFromApi(input);
        }

        return await fetchTicketsFromDatabase(supabase, userId, input);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : input.source === "api"
              ? "DummyJSON API is niet bereikbaar. Probeer het later opnieuw."
              : "Tickets konden niet uit de database worden opgehaald.";

        return {
          source: input.source,
          count: 0,
          totalAvailable: 0,
          tickets: [],
          error: message,
        };
      }
    },
  });
}
