import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** POST /auth/logout — wist sessie-cookies en redirect naar login. */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("[logout] signOut failed:", error);
  }

  return NextResponse.redirect(new URL("/login", request.url), { status: 302 });
}
