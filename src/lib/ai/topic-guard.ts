import type { Locale } from "@/lib/i18n/types";

/** Termen die duiden op een TicketIQ-gerelateerde vraag. */
const ON_TOPIC_PATTERN =
  /\b(ticket|tickets|analyse|analyze|analyser|categor|suggest|help\s*center|helpcenter|import|dashboard|label|labels|patroon|pattern|artikel|article|ticketiq|fetch|dummyjson|cluster|status|prioriteit|priority|organisatie|organization|duplicaat|duplicate|herschrijf|revise|goedkeur|afwijz|database|support|onderwerp|subject|body|bericht|tool|stap|stappen|opslaan|saved|importeer)\b/i;

/** Duidelijk off-topic — alleen afwijzen als er geen on-topic signaal is. */
const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\b(hoofdstad|capital of|wat is de hoofdstad|what is the capital)\b/i,
  /\b(vertel|tell)\s+(me\s+)?((een|a)\s+)?(grap|joke|mop)\b/i,
  /\b(maak|write|schrijf)\s+(me\s+)?(een\s+)?(gedicht|poem|verhaal|story|essay|rap)\b/i,
  /\b(weerbericht|weather forecast|weersverwachting)\b/i,
  /\b(recept|recipe)\s+(voor|for)\b/i,
  /\b(hoe\s+laat|what\s+time)\s+(is\s+het|is\s+it)\b/i,
  /\b(wie\s+is|who\s+is)\s+(de\s+|the\s+)?[a-z]/i,
  /\b(wat\s+is\s+\d+\s*[\+\-\*\/]\s*\d+)\b/i,
  /\b(bereken|calculate|solve)\s+.+\s*(=|\?)\s*$/i,
];

const ANALYZE_PROMPT_PATTERN =
  /\b(fetchTickets|assignTicketCategory|findExistingSuggestions|saveSuggestion|analyseer deze tickets|analyze these tickets)\b/i;

export function extractLastUserMessageText(messages: unknown[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index] as {
      role?: string;
      parts?: Array<{ type?: string; text?: string }>;
      content?: unknown;
    };

    if (message.role !== "user") continue;

    if (Array.isArray(message.parts)) {
      const text = message.parts
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("\n")
        .trim();

      if (text) return text;
    }

    if (typeof message.content === "string" && message.content.trim()) {
      return message.content.trim();
    }
  }

  return null;
}

export function isClearlyOffTopicMessage(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;

  if (ANALYZE_PROMPT_PATTERN.test(normalized)) {
    return false;
  }

  if (ON_TOPIC_PATTERN.test(normalized)) {
    return false;
  }

  return OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function getOffTopicDeclineMessage(locale: Locale): string {
  if (locale === "en") {
    return [
      "I'm built only for TicketIQ: analyzing support tickets, finding patterns, categorizing tickets, and drafting help center articles.",
      "",
      "Ask me something about your tickets, an analysis, categories, labels, suggestions, or how to use this app — for example: “Analyze my 50 most recent tickets” or “Which topics come up most often?”",
    ].join("\n");
  }

  return [
    "Ik ben alleen gebouwd voor TicketIQ: supporttickets analyseren, patronen vinden, tickets categoriseren en helpcenter-artikelen voorstellen.",
    "",
    "Stel een vraag over je tickets, een analyse, categorieën, labels, suggesties of het gebruik van deze app — bijvoorbeeld: “Analyseer mijn 50 meest recente tickets” of “Welke onderwerpen komen het meest voor?”",
  ].join("\n");
}
