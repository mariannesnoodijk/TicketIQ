import { describe, expect, it } from "vitest";

import { dummyJsonTicketsSchema } from "@/lib/dummyjson";

describe("dummyJsonTicketsSchema", () => {
  it("parses valid ticket array and coerces ticket_id to string", () => {
    const parsed = dummyJsonTicketsSchema.parse([
      {
        ticket_id: 42,
        onderwerp: "Test ticket",
        body: "Inhoud",
        labels: "payroll",
      },
    ]);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.ticket_id).toBe("42");
    expect(parsed[0]?.onderwerp).toBe("Test ticket");
  });

  it("rejects tickets without onderwerp", () => {
    expect(() =>
      dummyJsonTicketsSchema.parse([{ ticket_id: "1" }])
    ).toThrow();
  });

  it("accepts nullable optional fields", () => {
    const parsed = dummyJsonTicketsSchema.parse([
      {
        ticket_id: "t-1",
        onderwerp: "Minimaal ticket",
        datum: null,
        body: null,
        labels: null,
      },
    ]);

    expect(parsed[0]?.body).toBeNull();
  });
});
