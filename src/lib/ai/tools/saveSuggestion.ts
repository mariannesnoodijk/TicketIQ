import { tool } from "ai";
import { z } from "zod";

import { DEFAULT_CATEGORIES } from "@/lib/categories/defaultCategories";
import {
  ARTICLE_CONTENT_MIN_LENGTH,
  articleContentValidationMessage,
} from "@/lib/ai/articleContent";
import type { createClient } from "@/lib/supabase/server";
import type { AiSuggestionMetadata } from "@/types";
import type { SaveSuggestionResult } from "@/lib/ai/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const allowedCategoryNames = new Set<string>(DEFAULT_CATEGORIES.map((c) => c.name));

const saveSuggestionInputSchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().min(10).max(500),
  content: z.string().min(ARTICLE_CONTENT_MIN_LENGTH),
  categoryName: z.string(),
  sourceTicketExternalIds: z.array(z.string()).min(1),
  frequency: z.number().int().min(1),
  reasoning: z.string().optional(),
  isDuplicate: z.boolean(),
  similarSuggestionId: z.string().uuid().optional().nullable(),
});

export function createSaveSuggestionTool(
  supabase: SupabaseServerClient,
  userId: string
) {
  return tool({
    description:
      "Slaat een nieuwe helpcenter-suggestie op in de database. Gebruik alleen als er geen duplicaat is.",
    inputSchema: saveSuggestionInputSchema,
    execute: async (input): Promise<SaveSuggestionResult> => {
      try {
        const parsed = saveSuggestionInputSchema.safeParse(input);

        if (!parsed.success) {
          return {
            saved: false,
            message: `Ongeldige suggestie-input: ${parsed.error.issues[0]?.message ?? "validatiefout"}`,
          };
        }

        const data = parsed.data;

        const contentError = articleContentValidationMessage(data.content);
        if (contentError) {
          return {
            saved: false,
            message: `Suggestie "${data.title}" niet opgeslagen: ${contentError}`,
          };
        }

        if (data.isDuplicate) {
          return {
            saved: false,
            message: `Suggestie "${data.title}" niet opgeslagen: vergelijkbare documentatie bestaat al.`,
            metadata: {
              reasoning: data.reasoning,
              duplicateCheck: {
                isDuplicate: true,
                similarSuggestionId: data.similarSuggestionId ?? undefined,
              },
              sourceTicketIds: data.sourceTicketExternalIds,
            },
          };
        }

        if (!allowedCategoryNames.has(data.categoryName)) {
          return {
            saved: false,
            message: `Ongeldige categorie "${data.categoryName}". Kies een categorie uit de vaste lijst.`,
          };
        }

        const { data: category, error: categoryError } = await supabase
          .from("categories")
          .select("id, name")
          .eq("user_id", userId)
          .eq("name", data.categoryName)
          .maybeSingle();

        if (categoryError) {
          return { saved: false, message: categoryError.message };
        }

        const metadata: AiSuggestionMetadata = {
          reasoning: data.reasoning,
          duplicateCheck: {
            isDuplicate: false,
            similarSuggestionId: data.similarSuggestionId ?? undefined,
          },
          sourceTicketIds: data.sourceTicketExternalIds,
          confidence: Math.min(1, data.frequency / 10),
        };

        const { data: inserted, error: insertError } = await supabase
          .from("ai_suggestions")
          .insert({
            user_id: userId,
            title: data.title,
            summary: data.summary,
            content: data.content,
            status: "pending",
            category_id: category?.id ?? null,
            metadata,
          })
          .select("id, title")
          .single();

        if (insertError) {
          return { saved: false, message: insertError.message };
        }

        return {
          saved: true,
          suggestionId: inserted.id,
          title: inserted.title,
          message: `Suggestie "${inserted.title}" opgeslagen.`,
          metadata,
        };
      } catch (error) {
        return {
          saved: false,
          message:
            error instanceof Error
              ? error.message
              : "Kon de suggestie niet opslaan.",
        };
      }
    },
  });
}
