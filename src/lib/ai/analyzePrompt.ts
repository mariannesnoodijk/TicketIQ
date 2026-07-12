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

export function getAnalyzeLimitLabel(limit: AnalyzeTicketLimit, importedCount?: number): string {
  if (limit === TICKET_LIMIT_ALL) {
    return importedCount !== undefined
      ? `Alle geïmporteerde tickets (${importedCount})`
      : "Alle geïmporteerde tickets";
  }

  return getTicketLimitLabel(limit);
}

export function buildAnalyzePrompt(limit: AnalyzeTicketLimit): string {
  const fetchInstruction =
    limit === ANALYZE_LIMIT_ALL
      ? 'Roep `fetchTickets` aan met `source: "database"` en `fetchAll: true` om alle geïmporteerde supporttickets op te halen.'
      : `Roep \`fetchTickets\` aan met \`source: "database"\` en \`limit: ${limit}\` om de ${limit} meest recente geïmporteerde supporttickets op te halen.`;

  return `${fetchInstruction} Analyseer deze tickets: zoek terugkerende patronen, categoriseer ze met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.`;
}
