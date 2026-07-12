import { NextResponse } from "next/server";

import { categorizeUncategorizedTickets } from "@/lib/categories/categorizeTickets";
import { ensureDefaultCategories } from "@/lib/categories/ensureDefaultCategories";
import { createClient } from "@/lib/supabase/server";

/** Categoriseert bestaande tickets zonder opnieuw te importeren. */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const categoryByName = await ensureDefaultCategories(supabase, user.id);
    const categorized = await categorizeUncategorizedTickets(
      supabase,
      user.id,
      categoryByName
    );

    return NextResponse.json({ categorized });
  } catch (error) {
    console.error("[categorize] POST failed:", error);
    return NextResponse.json({ error: "Categorisatie mislukt" }, { status: 500 });
  }
}
