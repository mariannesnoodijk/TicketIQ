import { describe, expect, it } from "vitest";

import { AGENT_LIMITS } from "@/lib/ai/agent";

describe("createTicketIqAgent limits", () => {
  it("uses conservative agent step limit", () => {
    expect(AGENT_LIMITS.maxAgentSteps).toBe(8);
    expect(AGENT_LIMITS.maxAgentOutputTokens).toBe(4_096);
  });
});
