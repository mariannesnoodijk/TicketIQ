import { describe, expect, it } from "vitest";

import { buildAnalyzePrompt } from "@/lib/ai/analyzePrompt";
import { AI_LIMITS } from "@/lib/ai/limits";

describe("buildAnalyzePrompt", () => {
  it("instructs database fetch with limit in Dutch", () => {
    const prompt = buildAnalyzePrompt(25, "nl");

    expect(prompt).toContain('source: "database"');
    expect(prompt).toContain("limit: 25");
    expect(prompt).toContain("maximaal 5");
    expect(prompt).not.toContain("fetchAll");
  });

  it("builds English analyze prompt when locale is en", () => {
    const prompt = buildAnalyzePrompt(50, "en");

    expect(prompt).toContain('source: "database"');
    expect(prompt).toContain("limit: 50");
    expect(prompt).toContain("up to 5");
    expect(prompt).toMatch(/Analyze these tickets/i);
  });

  it("uses conservative analyze options by default", () => {
    expect(AI_LIMITS.analyzeTicketLimits).toEqual([25, 50]);
    expect(AI_LIMITS.maxTicketsPerFetch).toBe(50);
    expect(AI_LIMITS.agentRequestsPerHour).toBe(15);
  });
});
