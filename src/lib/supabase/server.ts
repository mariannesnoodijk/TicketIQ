import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

/**
 * Supabase-client voor Server Components, Route Handlers en Server Actions.
 * Gebruikt de cookies van de ingelogde gebruiker zodat RLS-policies gelden.
 */
export async function createClient() {
  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    throw new Error("Supabase is niet geconfigureerd");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseEnv.url,
    supabaseEnv.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Aangeroepen vanuit een Server Component; sessieverversing gebeurt in proxy.ts.
          }
        },
      },
    }
  );
}
