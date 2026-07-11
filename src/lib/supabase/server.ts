import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Supabase-client voor Server Components, Route Handlers en Server Actions.
 * Gebruikt de cookies van de ingelogde gebruiker zodat RLS-policies gelden.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
