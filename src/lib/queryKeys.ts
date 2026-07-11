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
    detail: (id: string) => ["ai-suggestions", id] as const,
  },
  stats: {
    dashboard: ["dashboard-stats"] as const,
    categoryDistribution: ["category-distribution"] as const,
  },
} as const;

export type TicketListFilters = {
  status?: string;
  categoryId?: string;
  labelId?: string;
  search?: string;
};
