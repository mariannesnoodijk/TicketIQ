import { tool } from "ai";
import { z } from "zod";

import { fetchDummyJsonTickets } from "@/lib/dummyjson";
import type { FetchTicketsResult } from "@/lib/ai/types";

const MAX_BODY_LENGTH = 400;

export function createFetchTicketsTool() {
  return tool({
    description:
      "Haalt supporttickets op uit de DummyJSON Custom Response API. Gebruik dit als eerste stap om ruwe ticketdata te verzamelen voor analyse.",
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50)
        .describe("Aantal tickets om op te halen (max 100)"),
      search: z
        .string()
        .optional()
        .describe("Optioneel zoekfilter op onderwerp of berichttekst"),
      label: z.string().optional().describe("Optioneel filter op bronslabel"),
    }),
    execute: async ({ limit, search, label }): Promise<FetchTicketsResult> => {
      try {
        const all = await fetchDummyJsonTickets();
        let filtered = all;

        if (search) {
          const query = search.toLowerCase();
          filtered = filtered.filter(
            (ticket) =>
              ticket.onderwerp.toLowerCase().includes(query) ||
              (ticket.body?.toLowerCase().includes(query) ?? false)
          );
        }

        if (label) {
          const labelQuery = label.toLowerCase();
          filtered = filtered.filter((ticket) =>
            (ticket.labels ?? "").toLowerCase().includes(labelQuery)
          );
        }

        const subset = filtered.slice(-limit);

        return {
          count: subset.length,
          totalAvailable: all.length,
          tickets: subset.map((ticket) => ({
            externalId: String(ticket.ticket_id),
            subject: ticket.onderwerp,
            body: ticket.body
              ? ticket.body.length > MAX_BODY_LENGTH
                ? `${ticket.body.slice(0, MAX_BODY_LENGTH)}…`
                : ticket.body
              : null,
            label: ticket.labels?.trim() ? ticket.labels.trim() : null,
            date: ticket.datum ?? null,
            sender: ticket.afzender_naam ?? null,
            organization: ticket.organisatie_naam ?? null,
          })),
        };
      } catch (error) {
        return {
          count: 0,
          totalAvailable: 0,
          tickets: [],
          error:
            error instanceof Error
              ? error.message
              : "DummyJSON API is niet bereikbaar. Probeer het later opnieuw.",
        };
      }
    },
  });
}
