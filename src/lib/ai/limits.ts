/** Standaardwaarden — streng getuned voor demo/productie (laag tokenverbruik). */
const DEFAULTS = {
  maxAgentSteps: 8,
  maxAgentOutputTokens: 4_096,
  maxChatMessages: 24,
  maxUserMessageChars: 2_000,
  maxTicketsPerFetch: 50,
  maxTicketBodyChars: 350,
  analyzeTicketLimits: [25, 50] as number[],
  defaultAnalyzeLimit: 50,
  maxReviseSourceTickets: 8,
  maxReviseTicketBodyChars: 500,
  maxReviseArticleChars: 6_000,
  maxReviseOutputTokens: 3_000,
  agentRequestsPerHour: 15,
  reviseRequestsPerHour: 15,
  rateLimitWindowMs: 60 * 60 * 1_000,
} as const;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;

  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseAnalyzeTicketLimits(value: string | undefined): number[] {
  if (!value?.trim()) {
    return [...DEFAULTS.analyzeTicketLimits];
  }

  const parsed = value
    .split(",")
    .map((part) => parsePositiveInt(part, 0))
    .filter((limit) => limit > 0);

  if (parsed.length === 0) {
    return [...DEFAULTS.analyzeTicketLimits];
  }

  return [...new Set(parsed)].toSorted((left, right) => left - right);
}

function resolveDefaultAnalyzeLimit(
  limits: number[],
  envValue: string | undefined
): number {
  const requested = parsePositiveInt(envValue, 0);
  if (requested > 0 && limits.includes(requested)) {
    return requested;
  }

  if (limits.includes(DEFAULTS.defaultAnalyzeLimit)) {
    return DEFAULTS.defaultAnalyzeLimit;
  }

  return limits[limits.length - 1] ?? DEFAULTS.defaultAnalyzeLimit;
}

function buildAiLimits() {
  const analyzeTicketLimits = parseAnalyzeTicketLimits(
    process.env.AI_ANALYZE_TICKET_LIMITS
  );

  return {
    maxAgentSteps: parsePositiveInt(
      process.env.AI_MAX_AGENT_STEPS,
      DEFAULTS.maxAgentSteps
    ),
    maxAgentOutputTokens: parsePositiveInt(
      process.env.AI_MAX_AGENT_OUTPUT_TOKENS,
      DEFAULTS.maxAgentOutputTokens
    ),
    maxChatMessages: parsePositiveInt(
      process.env.AI_MAX_CHAT_MESSAGES,
      DEFAULTS.maxChatMessages
    ),
    maxUserMessageChars: parsePositiveInt(
      process.env.AI_MAX_USER_MESSAGE_CHARS,
      DEFAULTS.maxUserMessageChars
    ),
    maxTicketsPerFetch: parsePositiveInt(
      process.env.AI_MAX_TICKETS_PER_FETCH,
      DEFAULTS.maxTicketsPerFetch
    ),
    maxTicketBodyChars: parsePositiveInt(
      process.env.AI_MAX_TICKET_BODY_CHARS,
      DEFAULTS.maxTicketBodyChars
    ),
    analyzeTicketLimits,
    defaultAnalyzeLimit: resolveDefaultAnalyzeLimit(
      analyzeTicketLimits,
      process.env.AI_DEFAULT_ANALYZE_LIMIT
    ),
    maxReviseSourceTickets: parsePositiveInt(
      process.env.AI_MAX_REVISE_SOURCE_TICKETS,
      DEFAULTS.maxReviseSourceTickets
    ),
    maxReviseTicketBodyChars: parsePositiveInt(
      process.env.AI_MAX_REVISE_TICKET_BODY_CHARS,
      DEFAULTS.maxReviseTicketBodyChars
    ),
    maxReviseArticleChars: parsePositiveInt(
      process.env.AI_MAX_REVISE_ARTICLE_CHARS,
      DEFAULTS.maxReviseArticleChars
    ),
    maxReviseOutputTokens: parsePositiveInt(
      process.env.AI_MAX_REVISE_OUTPUT_TOKENS,
      DEFAULTS.maxReviseOutputTokens
    ),
    agentRequestsPerHour: parsePositiveInt(
      process.env.AI_AGENT_REQUESTS_PER_HOUR,
      DEFAULTS.agentRequestsPerHour
    ),
    reviseRequestsPerHour: parsePositiveInt(
      process.env.AI_REVISE_REQUESTS_PER_HOUR,
      DEFAULTS.reviseRequestsPerHour
    ),
    rateLimitWindowMs: DEFAULTS.rateLimitWindowMs,
  };
}

/** Centrale limieten om AI-tokenverbruik en kosten te beheersen (env overschrijft defaults). */
export const AI_LIMITS = buildAiLimits();

export type AnalyzeTicketLimit = number;

export function parseAnalyzeTicketLimit(value: string): AnalyzeTicketLimit {
  const numeric = Number(value);

  if (AI_LIMITS.analyzeTicketLimits.includes(numeric)) {
    return numeric;
  }

  return AI_LIMITS.defaultAnalyzeLimit;
}

export function truncateForPrompt(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}…`;
}
