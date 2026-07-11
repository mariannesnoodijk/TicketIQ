import type { AiSuggestionMetadata } from "@/types";

export type FetchedTicketSummary = {
  externalId: string;
  subject: string;
  body: string | null;
  label: string | null;
  date: string | null;
  sender: string | null;
  organization: string | null;
};

export type FetchTicketsResult = {
  count: number;
  totalAvailable: number;
  tickets: FetchedTicketSummary[];
  error?: string;
};

export type ExistingSuggestionMatch = {
  id: string;
  title: string;
  summary: string | null;
  status: string;
};

export type SaveSuggestionInput = {
  title: string;
  summary: string;
  content: string;
  categoryName: string;
  sourceTicketExternalIds: string[];
  frequency: number;
  reasoning?: string;
  isDuplicate: boolean;
  similarSuggestionId?: string | null;
};

export type SaveSuggestionResult = {
  saved: boolean;
  suggestionId?: string;
  title?: string;
  message: string;
  metadata?: AiSuggestionMetadata;
};

export type AssignTicketCategoryResult = {
  updated: number;
  skipped: number;
  message: string;
  errors?: string[];
};
