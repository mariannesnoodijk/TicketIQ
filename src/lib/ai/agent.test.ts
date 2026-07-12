import { describe, expect, it } from "vitest";

import { MAX_AGENT_STEPS } from "@/lib/ai/agent";

describe("createTicketIqAgent config", () => {
  it("uses MAX_AGENT_STEPS of 10", () => {
    expect(MAX_AGENT_STEPS).toBe(10);
  });
});
