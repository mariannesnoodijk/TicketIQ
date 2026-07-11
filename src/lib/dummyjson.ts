import { z } from "zod";

const dummyJsonTicketSchema = z.object({
  ticket_id: z.union([z.string(), z.number()]).transform(String),
  datum: z.string().nullable().optional(),
  afzender_email: z.string().nullable().optional(),
  afzender_naam: z.string().nullable().optional(),
  organisatie_naam: z.string().nullable().optional(),
  onderwerp: z.string(),
  labels: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
});

export const dummyJsonTicketsSchema = z.array(dummyJsonTicketSchema);

export type DummyJsonTicket = z.infer<typeof dummyJsonTicketSchema>;

export function getDummyJsonTicketsUrl(): string {
  const url = process.env.NEXT_PUBLIC_DUMMYJSON_TICKETS_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_DUMMYJSON_TICKETS_URL is niet geconfigureerd");
  }
  return url;
}

/** Haalt supporttickets op uit de DummyJSON Custom Response API. */
export async function fetchDummyJsonTickets(): Promise<DummyJsonTicket[]> {
  const response = await fetch(getDummyJsonTicketsUrl(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`DummyJSON API fout: ${response.status} ${response.statusText}`);
  }

  const json: unknown = await response.json();
  return dummyJsonTicketsSchema.parse(json);
}
