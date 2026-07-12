import { describe, expect, it } from "vitest";

import {
  extractLastUserMessageText,
  isClearlyOffTopicMessage,
} from "@/lib/ai/topic-guard";

describe("topic-guard", () => {
  it("flags obvious off-topic questions", () => {
    expect(isClearlyOffTopicMessage("Wat is de hoofdstad van Frankrijk?")).toBe(true);
    expect(isClearlyOffTopicMessage("Vertel me een grap")).toBe(true);
    expect(isClearlyOffTopicMessage("Tell me a joke")).toBe(true);
  });

  it("allows ticket-related questions", () => {
    expect(isClearlyOffTopicMessage("Analyseer mijn tickets op terugkerende patronen")).toBe(
      false
    );
    expect(isClearlyOffTopicMessage("How many open tickets do I have?")).toBe(false);
    expect(isClearlyOffTopicMessage("Welke suggesties zijn goedgekeurd?")).toBe(false);
  });

  it("allows the standard analyze prompt", () => {
    expect(
      isClearlyOffTopicMessage(
        'Roep `fetchTickets` aan met `source: "database"` en `limit: 50`'
      )
    ).toBe(false);
  });

  it("extracts the latest user message text", () => {
    const text = extractLastUserMessageText([
      { role: "assistant", parts: [{ type: "text", text: "Hallo" }] },
      { role: "user", parts: [{ type: "text", text: "Vertel een grap" }] },
    ]);

    expect(text).toBe("Vertel een grap");
  });
});
