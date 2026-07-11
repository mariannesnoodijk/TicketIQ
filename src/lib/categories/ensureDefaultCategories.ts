import { DEFAULT_CATEGORIES } from "@/lib/categories/defaultCategories";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchCategoryMap(
  supabase: SupabaseServerClient,
  userId: string
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((c) => [c.name, c.id]));
}

/** Zorgt dat alle standaardcategorieën bestaan en retourneert een map naam → id. */
export async function ensureDefaultCategories(
  supabase: SupabaseServerClient,
  userId: string
): Promise<Map<string, string>> {
  const categoryByName = await fetchCategoryMap(supabase, userId);
  const missing = DEFAULT_CATEGORIES.filter((c) => !categoryByName.has(c.name));

  if (missing.length > 0) {
    const { error: insertError } = await supabase.from("categories").insert(
      missing.map((c) => ({
        user_id: userId,
        name: c.name,
        color: c.color,
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  // Altijd opnieuw ophalen zodat de map compleet is (insert().select() kan leeg terugkomen).
  return fetchCategoryMap(supabase, userId);
}
