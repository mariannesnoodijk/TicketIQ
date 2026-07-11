import { tool } from "ai";
import { z } from "zod";

import type { createClient } from "@/lib/supabase/server";
import type { ExistingSuggestionMatch } from "@/lib/ai/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function createFindExistingSuggestionsTool(
  supabase: SupabaseServerClient,
  userId: string
) {
  return tool({
    description:
      "Zoekt bestaande helpcenter-suggesties (goedgekeurd, pending of draft) die vergelijkbaar zijn met een onderwerp, om duplicaten te voorkomen.",
    inputSchema: z.object({
      topic: z.string().describe("Onderwerp of thema om op te zoeken"),
    }),
    execute: async ({ topic }): Promise<{
      suggestions: ExistingSuggestionMatch[];
      error?: string;
    }> => {
      try {
        const { data, error } = await supabase
          .from("ai_suggestions")
          .select("id, title, summary, status")
          .eq("user_id", userId)
          .in("status", ["approved", "pending", "draft"])
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          return { suggestions: [], error: error.message };
        }

        const topicLower = topic.toLowerCase();
        const suggestions = (data ?? [])
          .filter(
            (item) =>
              item.title.toLowerCase().includes(topicLower) ||
              (item.summary?.toLowerCase().includes(topicLower) ?? false)
          )
          .slice(0, 5);

        return { suggestions };
      } catch (error) {
        return {
          suggestions: [],
          error:
            error instanceof Error
              ? error.message
              : "Kon bestaande suggesties niet opzoeken.",
        };
      }
    },
  });
}
