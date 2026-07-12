import { describe, expect, it } from "vitest";

import { AI_LIMITS } from "@/lib/ai/limits";
import { checkAiRateLimit } from "@/lib/ai/rate-limit";

describe("checkAiRateLimit", () => {
  it("allows requests under the hourly limit", () => {
    const userId = `test-user-${Date.now()}`;

    const first = checkAiRateLimit(userId, "agent");
    const second = checkAiRateLimit(userId, "agent");

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    if (first.allowed && second.allowed) {
      expect(second.remaining).toBe(AI_LIMITS.agentRequestsPerHour - 2);
    }
  });

  it("blocks after exceeding the hourly limit", () => {
    const userId = `blocked-user-${Date.now()}`;

    for (let i = 0; i < AI_LIMITS.reviseRequestsPerHour; i += 1) {
      const result = checkAiRateLimit(userId, "revise");
      expect(result.allowed).toBe(true);
    }

    const blocked = checkAiRateLimit(userId, "revise");
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
