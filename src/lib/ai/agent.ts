import { ToolLoopAgent, isStepCount } from "ai";
import { openai } from "@ai-sdk/openai";

import { getAgentInstructions } from "@/lib/ai/prompts";
import { createAssignTicketCategoryTool } from "@/lib/ai/tools/assignTicketCategory";
import { createFetchTicketsTool } from "@/lib/ai/tools/fetchTickets";
import { createFindExistingSuggestionsTool } from "@/lib/ai/tools/findExistingSuggestions";
import { createSaveSuggestionTool } from "@/lib/ai/tools/saveSuggestion";
import type { Locale } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const AGENT_MODEL = openai("gpt-4.1-mini");
const MAX_AGENT_STEPS = 10;

/** Maakt een per-request TicketIQ-agent met tools gekoppeld aan de ingelogde gebruiker. */
export function createTicketIqAgent(
  supabase: SupabaseServerClient,
  userId: string,
  locale: Locale = "nl"
) {
  return new ToolLoopAgent({
    model: AGENT_MODEL,
    instructions: getAgentInstructions(locale),
    tools: {
      fetchTickets: createFetchTicketsTool(supabase, userId),
      assignTicketCategory: createAssignTicketCategoryTool(supabase, userId),
      findExistingSuggestions: createFindExistingSuggestionsTool(supabase, userId),
      saveSuggestion: createSaveSuggestionTool(supabase, userId),
    },
    stopWhen: isStepCount(MAX_AGENT_STEPS),
  });
}

export { AGENT_MODEL, MAX_AGENT_STEPS };
