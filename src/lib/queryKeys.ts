/** Gecentraliseerde React Query keys voor cache-invalidatie. */
export const queryKeys = {
  categories: {
    all: ["categories"] as const,
    detail: (id: string) => ["categories", id] as const,
  },
  labels: {
    all: ["labels"] as const,
    detail: (id: string) => ["labels", id] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    lists: () => ["tickets", "list"] as const,
    list: (filters: TicketListFilters) => ["tickets", "list", filters] as const,
    detail: (id: string) => ["tickets", id] as const,
  },
  aiSuggestions: {
    all: ["ai-suggestions"] as const,
    lists: () => ["ai-suggestions", "list"] as const,
    list: (filters: AiSuggestionListFilters) => ["ai-suggestions", "list", filters] as const,
    detail: (id: string) => ["ai-suggestions", id] as const,
  },
  stats: {
    dashboard: ["dashboard-stats"] as const,
    /** @deprecated gebruik ticketAnalytics(period) */
    categoryDistribution: ["category-distribution"] as const,
    ticketAnalytics: (period: string) => ["ticket-analytics", period] as const,
    ticketAnalyticsRoot: ["ticket-analytics"] as const,
    suggestionStatusDistribution: (period: string) =>
      ["suggestion-status-distribution", period] as const,
    suggestionStatusRoot: ["suggestion-status-distribution"] as const,
  },
} as const;

export type TicketListFilters = {
  status?: string;
  categoryId?: string;
  labelId?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  weekday?: number;
  organization?: string;
};

export type AiSuggestionListFilters = {
  status?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
};
