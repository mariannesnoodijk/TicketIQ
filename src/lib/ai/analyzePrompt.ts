export const ANALYZE_LIMIT_OPTIONS = [50, 100] as const;

export type AnalyzeTicketLimit = (typeof ANALYZE_LIMIT_OPTIONS)[number];

export function buildAnalyzePrompt(limit: number): string {
  return `Analyseer de laatste ${limit} supporttickets. Zoek terugkerende patronen, categoriseer de tickets met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.`;
}
