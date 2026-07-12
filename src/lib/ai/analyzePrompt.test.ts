import { describe, expect, it } from "vitest";

import { buildAnalyzePrompt } from "@/lib/ai/analyzePrompt";

describe("buildAnalyzePrompt", () => {
  it("instructs database fetch with limit in Dutch", () => {
    const prompt = buildAnalyzePrompt(25, "nl");

    expect(prompt).toContain('source: "database"');
    expect(prompt).toContain("limit: 25");
    expect(prompt).toContain("maximaal 5");
  });

  it("instructs fetchAll for all tickets in Dutch", () => {
    const prompt = buildAnalyzePrompt("all", "nl");

    expect(prompt).toContain("fetchAll: true");
    expect(prompt).toContain('source: "database"');
  });

  it("builds English analyze prompt when locale is en", () => {
    const prompt = buildAnalyzePrompt(50, "en");

    expect(prompt).toContain('source: "database"');
    expect(prompt).toContain("limit: 50");
    expect(prompt).toContain("up to 5");
    expect(prompt).toMatch(/Analyze these tickets/i);
  });
});
