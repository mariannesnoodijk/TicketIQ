import { generateObject } from "ai";
import { z } from "zod";

import {
  ARTICLE_STRUCTURE_TEMPLATE,
  articleContentValidationMessage,
} from "@/lib/ai/articleContent";
import { AGENT_MODEL } from "@/lib/ai/agent";
import { REVISE_SUGGESTION_INSTRUCTIONS } from "@/lib/ai/prompts";
import { fetchSourceTicketsForSuggestion } from "@/lib/suggestions/fetchSourceTickets";
import type { createClient } from "@/lib/supabase/server";
import type { AiSuggestionMetadata } from "@/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const revisedArticleSchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().min(10).max(500),
  content: z.string().min(400),
});

export type ReviseSuggestionInput = {
  supabase: SupabaseServerClient;
  userId: string;
  suggestionId: string;
  feedback: string;
};

export type ReviseSuggestionResult =
  | { success: true; suggestionId: string; title: string }
  | { success: false; error: string };

function buildRevisePrompt({
  title,
  summary,
  content,
  feedback,
  sourceTickets,
}: {
  title: string;
  summary: string | null;
  content: string;
  feedback: string;
  sourceTickets: Awaited<ReturnType<typeof fetchSourceTicketsForSuggestion>>;
}): string {
  const ticketBlock =
    sourceTickets.length > 0
      ? sourceTickets
          .map(
            (ticket) =>
              `- [${ticket.externalId}] ${ticket.subject}\n  ${ticket.body ?? "(geen berichttekst)"}`
          )
          .join("\n")
      : "(Geen bron-tickets beschikbaar in de database.)";

  return `Herschrijf dit helpcenter-artikel op basis van de feedback.

## Feedback van supportmedewerker
${feedback}

## Huidige suggestie
Titel: ${title}
Samenvatting: ${summary ?? "(leeg)"}

Inhoud:
${content}

## Bron-supporttickets
${ticketBlock}

## Vereiste structuur voor content
${ARTICLE_STRUCTURE_TEMPLATE}

Lever een verbeterde titel, samenvatting en volledige artikeltekst met concrete stappen.`;
}

export async function reviseSuggestionArticle(
  input: ReviseSuggestionInput
): Promise<ReviseSuggestionResult> {
  const { supabase, userId, suggestionId, feedback } = input;
  const trimmedFeedback = feedback.trim();

  if (trimmedFeedback.length < 10) {
    return { success: false, error: "Feedback moet minimaal 10 tekens bevatten." };
  }

  const { data: suggestion, error: fetchError } = await supabase
    .from("ai_suggestions")
    .select("id, title, summary, content, metadata")
    .eq("id", suggestionId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !suggestion) {
    return { success: false, error: "Suggestie niet gevonden." };
  }

  const metadata = (suggestion.metadata ?? {}) as AiSuggestionMetadata;
  const sourceTickets = await fetchSourceTicketsForSuggestion(
    supabase,
    userId,
    metadata.sourceTicketIds
  );

  const { object } = await generateObject({
    model: AGENT_MODEL,
    schema: revisedArticleSchema,
    system: REVISE_SUGGESTION_INSTRUCTIONS,
    prompt: buildRevisePrompt({
      title: suggestion.title,
      summary: suggestion.summary,
      content: suggestion.content,
      feedback: trimmedFeedback,
      sourceTickets,
    }),
  });

  const contentError = articleContentValidationMessage(object.content);
  if (contentError) {
    return {
      success: false,
      error: `AI genereerde onvoldoende artikeltekst: ${contentError}`,
    };
  }

  const revisionHistory = [
    ...(metadata.revisionHistory ?? []),
    {
      feedback: trimmedFeedback,
      at: new Date().toISOString(),
      action: "revised" as const,
    },
  ];

  const updatedMetadata: AiSuggestionMetadata = {
    ...metadata,
    revisionFeedback: trimmedFeedback,
    revisionHistory,
  };

  const { error: updateError } = await supabase
    .from("ai_suggestions")
    .update({
      title: object.title.trim(),
      summary: object.summary.trim(),
      content: object.content.trim(),
      status: "draft",
      metadata: updatedMetadata,
    })
    .eq("id", suggestionId)
    .eq("user_id", userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return {
    success: true,
    suggestionId,
    title: object.title.trim(),
  };
}
