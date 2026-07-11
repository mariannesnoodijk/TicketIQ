import { NextResponse } from "next/server";
import { z } from "zod";

import { reviseSuggestionArticle } from "@/lib/suggestions/reviseSuggestion";
import { createClient } from "@/lib/supabase/server";

const reviseBodySchema = z.object({
  feedback: z.string().min(10).max(2000),
});

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

    const { id } = await context.params;
    const body = reviseBodySchema.parse(await request.json());

    const result = await reviseSuggestionArticle({
      supabase,
      userId: user.id,
      suggestionId: id,
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

    const message =
      error instanceof Error ? error.message : "Suggestie kon niet worden herschreven";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
