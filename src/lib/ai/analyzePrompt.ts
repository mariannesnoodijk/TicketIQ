import { AI_LIMITS } from "@/lib/ai/limits";
import type { Locale } from "@/lib/i18n/types";
import { getTicketLimitLabel } from "@/lib/tickets/limits";

export const ANALYZE_LIMIT_OPTIONS = AI_LIMITS.analyzeTicketLimits;

export type { AnalyzeTicketLimit } from "@/lib/ai/limits";
export { parseAnalyzeTicketLimit } from "@/lib/ai/limits";

export function getAnalyzeLimitLabel(
  limit: (typeof ANALYZE_LIMIT_OPTIONS)[number],
  _importedCount?: number,
  locale: Locale = "nl"
): string {
  if (locale === "en") {
    return `${limit} tickets`;
  }

  return getTicketLimitLabel(limit, undefined, locale);
}

export function buildAnalyzePrompt(
  limit: (typeof ANALYZE_LIMIT_OPTIONS)[number],
  locale: Locale = "nl"
): string {
  if (locale === "en") {
    return `Call \`fetchTickets\` with \`source: "database"\` and \`limit: ${limit}\` to fetch the ${limit} most recent imported support tickets. Analyze these tickets: find recurring patterns, categorize them with assignTicketCategory, check for duplicates, and save up to 5 new help center suggestions. Then explain what you found.`;
  }

  return `Roep \`fetchTickets\` aan met \`source: "database"\` en \`limit: ${limit}\` om de ${limit} meest recente geïmporteerde supporttickets op te halen. Analyseer deze tickets: zoek terugkerende patronen, categoriseer ze met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.`;
}
