import { inferCategoryName } from "@/lib/categories/inferCategory";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const UPDATE_BATCH_SIZE = 50;

type TicketForCategorization = {
  id: string;
  subject: string;
  body: string | null;
  raw_payload: unknown;
};

function getSourceLabel(rawPayload: unknown): string | null {
  if (!rawPayload || typeof rawPayload !== "object") return null;
  const labels = (rawPayload as { labels?: string | null }).labels;
  return labels?.trim() ? labels.trim() : null;
}

/** Wijst categorieën toe aan tickets zonder category_id. Retourneert aantal bijgewerkte tickets. */
export async function categorizeUncategorizedTickets(
  supabase: SupabaseServerClient,
  userId: string,
  categoryByName: Map<string, string>
): Promise<number> {
  const fallbackCategoryId = categoryByName.get("Overig / Onboarding nieuwe klant");

  const { data: uncategorized, error } = await supabase
    .from("tickets")
    .select("id, subject, body, raw_payload")
    .eq("user_id", userId)
    .is("category_id", null);

  if (error) {
    throw new Error(error.message);
  }

  if (!uncategorized?.length) {
    return 0;
  }

  const idsByCategoryId = new Map<string, string[]>();

  for (const ticket of uncategorized as TicketForCategorization[]) {
    const categoryName = inferCategoryName(
      ticket.subject,
      ticket.body,
      getSourceLabel(ticket.raw_payload)
    );
    const categoryId = categoryByName.get(categoryName) ?? fallbackCategoryId;

    if (!categoryId) continue;

    const existing = idsByCategoryId.get(categoryId) ?? [];
    existing.push(ticket.id);
    idsByCategoryId.set(categoryId, existing);
  }

  let updated = 0;

  for (const [categoryId, ticketIds] of idsByCategoryId) {
    for (let i = 0; i < ticketIds.length; i += UPDATE_BATCH_SIZE) {
      const batchIds = ticketIds.slice(i, i + UPDATE_BATCH_SIZE);

      const { data, error: updateError } = await supabase
        .from("tickets")
        .update({ category_id: categoryId })
        .eq("user_id", userId)
        .in("id", batchIds)
        .select("id");

      if (updateError) {
        throw new Error(updateError.message);
      }

      updated += data?.length ?? 0;
    }
  }

  return updated;
}
