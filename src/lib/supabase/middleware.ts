import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv } from "@/lib/env/public";

const AUTH_ROUTES = ["/login", "/register"] as const;
const PROTECTED_PREFIXES = ["/dashboard"] as const;

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function missingSupabaseEnvResponse() {
  return new NextResponse(
    "TicketIQ: Supabase is niet geconfigureerd. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in op Vercel en deploy opnieuw.",
    { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }
  );
}

/** Ververs de Supabase-sessie en handhaaf auth-redirects in proxy.ts. */
export async function updateSession(request: NextRequest) {
  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    return missingSupabaseEnvResponse();
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    if (!user && isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (user && (pathname === "/" || isAuthRoute(pathname))) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/home";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[proxy] Supabase session update failed:", error);
    return NextResponse.next({ request });
  }
}
