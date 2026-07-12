import { NextResponse } from "next/server";
import { z } from "zod";

import { parseJsonBody } from "@/lib/api/parse-json-body";
import { reviseSuggestionArticle } from "@/lib/suggestions/reviseSuggestion";
import { checkAiRateLimit } from "@/lib/ai/rate-limit";
import { createClient } from "@/lib/supabase/server";

const reviseBodySchema = z.object({
  feedback: z.string().min(10).max(2000),
});

const suggestionIdSchema = z.string().uuid();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is niet geconfigureerd." },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const rateLimit = checkAiRateLimit(user.id, "revise");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Te veel herschrijf-verzoeken. Probeer over ${Math.ceil(rateLimit.retryAfterSec / 60)} minuten opnieuw.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSec) },
        }
      );
    }

    const { id } = await context.params;
    const idResult = suggestionIdSchema.safeParse(id);

    if (!idResult.success) {
      return NextResponse.json({ error: "Ongeldige suggestie-id" }, { status: 400 });
    }

    const parsed = await parseJsonBody<{ feedback?: string }>(request);

    if (!parsed.ok) {
      return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
    }

    const body = reviseBodySchema.parse(parsed.body);

    const result = await reviseSuggestionArticle({
      supabase,
      userId: user.id,
      suggestionId: idResult.data,
      feedback: body.feedback,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      suggestionId: result.suggestionId,
      title: result.title,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Ongeldige invoer" },
        { status: 400 }
      );
    }

    console.error("[revise] POST failed:", error);
    return NextResponse.json(
      { error: "Suggestie kon niet worden herschreven" },
      { status: 500 }
    );
  }
}
