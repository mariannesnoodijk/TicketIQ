import { describe, expect, it } from "vitest";

import { AI_LIMITS } from "@/lib/ai/limits";
import { prepareAgentMessages } from "@/lib/ai/trim-messages";

describe("prepareAgentMessages", () => {
  it("keeps only the most recent messages", () => {
    const messages = Array.from({ length: 30 }, (_, index) => ({
      id: String(index),
      role: "user",
      parts: [{ type: "text", text: `message ${index}` }],
    }));

    const trimmed = prepareAgentMessages(messages) as typeof messages;

    expect(trimmed).toHaveLength(AI_LIMITS.maxChatMessages);
    expect(trimmed[0]?.parts[0]).toMatchObject({ text: "message 6" });
  });

  it("truncates long user text", () => {
    const longText = "a".repeat(AI_LIMITS.maxUserMessageChars + 50);
    const trimmed = prepareAgentMessages([
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: longText }],
      },
    ]) as Array<{ parts: Array<{ text: string }> }>;

    expect(trimmed[0]?.parts[0]?.text.length).toBe(
      AI_LIMITS.maxUserMessageChars + 1
    );
    expect(trimmed[0]?.parts[0]?.text.endsWith("…")).toBe(true);
  });
});
