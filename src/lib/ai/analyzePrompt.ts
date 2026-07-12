import type { Locale } from "@/lib/i18n/types";
import {
  getTicketLimitLabel,
  parseTicketDisplayLimit,
  TICKET_LIMIT_ALL,
  TICKET_LIMIT_OPTIONS,
  type TicketDisplayLimit,
} from "@/lib/tickets/limits";

export const ANALYZE_LIMIT_OPTIONS = TICKET_LIMIT_OPTIONS;
export const ANALYZE_LIMIT_ALL = TICKET_LIMIT_ALL;
export type AnalyzeTicketLimit = TicketDisplayLimit;

export const parseAnalyzeTicketLimit = parseTicketDisplayLimit;

export function getAnalyzeLimitLabel(
  limit: AnalyzeTicketLimit,
  importedCount?: number,
  locale: Locale = "nl"
): string {
  if (limit === TICKET_LIMIT_ALL) {
    if (locale === "en") {
      return importedCount !== undefined
        ? `All imported tickets (${importedCount})`
        : "All imported tickets";
    }

    return importedCount !== undefined
      ? `Alle geïmporteerde tickets (${importedCount})`
      : "Alle geïmporteerde tickets";
  }

  if (locale === "en") {
    return `${limit} tickets`;
  }

  return getTicketLimitLabel(limit, undefined, locale);
}

export function buildAnalyzePrompt(limit: AnalyzeTicketLimit, locale: Locale = "nl"): string {
  if (locale === "en") {
    const fetchInstruction =
      limit === ANALYZE_LIMIT_ALL
        ? 'Call `fetchTickets` with `source: "database"` and `fetchAll: true` to fetch all imported support tickets.'
        : `Call \`fetchTickets\` with \`source: "database"\` and \`limit: ${limit}\` to fetch the ${limit} most recent imported support tickets.`;

    return `${fetchInstruction} Analyze these tickets: find recurring patterns, categorize them with assignTicketCategory, check for duplicates, and save up to 5 new help center suggestions. Then explain what you found.`;
  }

  const fetchInstruction =
    limit === ANALYZE_LIMIT_ALL
      ? 'Roep `fetchTickets` aan met `source: "database"` en `fetchAll: true` om alle geïmporteerde supporttickets op te halen.'
      : `Roep \`fetchTickets\` aan met \`source: "database"\` en \`limit: ${limit}\` om de ${limit} meest recente geïmporteerde supporttickets op te halen.`;

  return `${fetchInstruction} Analyseer deze tickets: zoek terugkerende patronen, categoriseer ze met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.`;
}
