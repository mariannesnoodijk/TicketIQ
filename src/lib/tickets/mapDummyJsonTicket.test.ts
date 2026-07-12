import { describe, expect, it } from "vitest";

import type { DummyJsonTicket } from "@/lib/dummyjson";
import { mapDummyJsonTicket } from "@/lib/tickets/mapDummyJsonTicket";

describe("mapDummyJsonTicket", () => {
  it("maps DummyJSON fields to Supabase ticket insert shape", () => {
    const raw: DummyJsonTicket = {
      ticket_id: "123",
      datum: "2025-06-01 10:30:00",
      onderwerp: "Loonstrook ontbreekt",
      body: "Medewerker ziet geen loonstrook",
      labels: " payroll ",
      afzender_email: "test@example.com",
    };

    const { ticket, sourceLabel } = mapDummyJsonTicket(raw);

    expect(ticket.external_id).toBe("123");
    expect(ticket.subject).toBe("Loonstrook ontbreekt");
    expect(ticket.channel).toBe("email");
    expect(ticket.status).toBe("open");
    expect(ticket.ticket_created_at).toMatch(/^2025-06-01T\d{2}:30:00\.000Z$/);
    expect(ticket.raw_payload).toMatchObject({ ticket_id: "123", labels: " payroll " });
    expect(sourceLabel).toBe("payroll");
  });

  it("returns null sourceLabel for empty labels", () => {
    const { sourceLabel } = mapDummyJsonTicket({
      ticket_id: "1",
      onderwerp: "Test",
      labels: "   ",
    });

    expect(sourceLabel).toBeNull();
  });
});
