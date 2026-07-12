import { isSupabaseConfigured } from "@/lib/env/public";

export function GET() {
  return Response.json({
    ok: true,
    supabase: isSupabaseConfigured(),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
}
