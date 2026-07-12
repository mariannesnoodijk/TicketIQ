import { AI_LIMITS } from "@/lib/ai/limits";

type TextPart = { type: "text"; text: string };
type MessagePart = TextPart | { type: string; [key: string]: unknown };
type ChatMessage = {
  role?: string;
  parts?: MessagePart[];
  content?: unknown;
  [key: string]: unknown;
};

function truncateTextParts(parts: MessagePart[]): MessagePart[] {
  return parts.map((part) => {
    if (part.type !== "text" || typeof part.text !== "string") {
      return part;
    }

    if (part.text.length <= AI_LIMITS.maxUserMessageChars) {
      return part;
    }

    return {
      ...part,
      text: `${part.text.slice(0, AI_LIMITS.maxUserMessageChars)}…`,
    };
  });
}

/** Beperkt chatgeschiedenis en truncates lange gebruikersberichten vóór de LLM-call. */
export function prepareAgentMessages(messages: unknown[]): unknown[] {
  const typed = messages as ChatMessage[];
  const recent = typed.slice(-AI_LIMITS.maxChatMessages);

  return recent.map((message) => {
    if (!Array.isArray(message.parts)) {
      return message;
    }

    const parts =
      message.role === "user"
        ? truncateTextParts(message.parts)
        : message.parts;

    return { ...message, parts };
  });
}
