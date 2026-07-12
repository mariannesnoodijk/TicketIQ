export const TICKET_LIMIT_OPTIONS = [50, 100, 200, 500] as const;

export const TICKET_LIMIT_ALL = "all" as const;

export type TicketDisplayLimit =
  | (typeof TICKET_LIMIT_OPTIONS)[number]
  | typeof TICKET_LIMIT_ALL;

export const DEFAULT_TICKET_DISPLAY_LIMIT: TicketDisplayLimit = 50;

export function parseTicketDisplayLimit(value: string): TicketDisplayLimit {
  if (value === TICKET_LIMIT_ALL) {
    return TICKET_LIMIT_ALL;
  }

  const numeric = Number(value);
  if (TICKET_LIMIT_OPTIONS.includes(numeric as (typeof TICKET_LIMIT_OPTIONS)[number])) {
    return numeric as TicketDisplayLimit;
  }

  return DEFAULT_TICKET_DISPLAY_LIMIT;
}

export function getTicketLimitLabel(
  limit: TicketDisplayLimit,
  totalCount?: number
): string {
  if (limit === TICKET_LIMIT_ALL) {
    return totalCount !== undefined
      ? `Alle tickets (${totalCount})`
      : "Alle tickets";
  }

  return `${limit} tickets`;
}

export function getNextTicketLimit(
  current: TicketDisplayLimit
): TicketDisplayLimit | null {
  if (current === TICKET_LIMIT_ALL) {
    return null;
  }

  const currentIndex = TICKET_LIMIT_OPTIONS.indexOf(current);
  if (currentIndex === -1) {
    return TICKET_LIMIT_OPTIONS[0];
  }

  if (currentIndex < TICKET_LIMIT_OPTIONS.length - 1) {
    return TICKET_LIMIT_OPTIONS[currentIndex + 1];
  }

  return TICKET_LIMIT_ALL;
}

export function getVisibleTicketCount(
  limit: TicketDisplayLimit,
  totalCount: number
): number {
  if (limit === TICKET_LIMIT_ALL) {
    return totalCount;
  }

  return Math.min(limit, totalCount);
}
