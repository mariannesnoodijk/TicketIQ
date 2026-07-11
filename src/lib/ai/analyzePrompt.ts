export const ANALYZE_LIMIT_OPTIONS = [50, 100, 200, 500] as const;

export const ANALYZE_LIMIT_ALL = "all" as const;

export type AnalyzeTicketLimit =
  | (typeof ANALYZE_LIMIT_OPTIONS)[number]
  | typeof ANALYZE_LIMIT_ALL;

export function parseAnalyzeTicketLimit(value: string): AnalyzeTicketLimit {
  if (value === ANALYZE_LIMIT_ALL) {
    return ANALYZE_LIMIT_ALL;
  }

  const numeric = Number(value);
  if (ANALYZE_LIMIT_OPTIONS.includes(numeric as (typeof ANALYZE_LIMIT_OPTIONS)[number])) {
    return numeric as AnalyzeTicketLimit;
  }

  return 50;
}

export function getAnalyzeLimitLabel(limit: AnalyzeTicketLimit, importedCount?: number): string {
  if (limit === ANALYZE_LIMIT_ALL) {
    return importedCount !== undefined
      ? `Alle geïmporteerde tickets (${importedCount})`
      : "Alle geïmporteerde tickets";
  }

  return `${limit} tickets`;
}

export function buildAnalyzePrompt(limit: AnalyzeTicketLimit): string {
  const fetchInstruction =
    limit === ANALYZE_LIMIT_ALL
      ? 'Roep `fetchTickets` aan met `source: "database"` en `fetchAll: true` om alle geïmporteerde supporttickets op te halen.'
      : `Roep \`fetchTickets\` aan met \`source: "database"\` en \`limit: ${limit}\` om de ${limit} meest recente geïmporteerde supporttickets op te halen.`;

  return `${fetchInstruction} Analyseer deze tickets: zoek terugkerende patronen, categoriseer ze met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.`;
}
