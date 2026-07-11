import type { Tables, TablesInsert, TablesUpdate } from "./database";

export type TicketStatus = "open" | "closed" | "pending";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type SuggestionStatus = "pending" | "approved" | "rejected" | "draft";

export type Category = Tables<"categories">;
export type CategoryInsert = TablesInsert<"categories">;
export type CategoryUpdate = TablesUpdate<"categories">;

export type Ticket = Tables<"tickets">;
export type TicketInsert = TablesInsert<"tickets">;
export type TicketUpdate = TablesUpdate<"tickets">;

export type Label = Tables<"labels">;
export type LabelInsert = TablesInsert<"labels">;
export type LabelUpdate = TablesUpdate<"labels">;

export type TicketLabel = Tables<"ticket_labels">;
export type TicketLabelInsert = TablesInsert<"ticket_labels">;

export type AiSuggestion = Tables<"ai_suggestions">;
export type AiSuggestionInsert = TablesInsert<"ai_suggestions">;
export type AiSuggestionUpdate = TablesUpdate<"ai_suggestions">;

/** Structured metadata stored in ai_suggestions.metadata (jsonb). */
export type AiSuggestionMetadata = {
  reasoning?: string;
  duplicateCheck?: {
    isDuplicate: boolean;
    similarSuggestionId?: string;
  };
  sourceTicketIds?: string[];
  confidence?: number;
  revisionFeedback?: string;
  revisedFromId?: string;
  revisionHistory?: Array<{
    feedback: string;
    at: string;
    action: "rejected" | "revised";
  }>;
};
