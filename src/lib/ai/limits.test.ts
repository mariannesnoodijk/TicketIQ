import { describe, expect, it } from "vitest";

import { AI_LIMITS } from "@/lib/ai/limits";

describe("AI_LIMITS defaults", () => {
  it("uses strict demo-friendly defaults", () => {
    expect(AI_LIMITS.analyzeTicketLimits).toEqual([25, 50]);
    expect(AI_LIMITS.defaultAnalyzeLimit).toBe(50);
    expect(AI_LIMITS.maxTicketsPerFetch).toBe(50);
    expect(AI_LIMITS.maxAgentSteps).toBe(8);
    expect(AI_LIMITS.agentRequestsPerHour).toBe(15);
    expect(AI_LIMITS.reviseRequestsPerHour).toBe(15);
  });
});
