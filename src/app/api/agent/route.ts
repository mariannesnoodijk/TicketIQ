import { createAgentUIStreamResponse } from "ai";
import { NextResponse } from "next/server";

import { createTicketIqAgent } from "@/lib/ai/agent";
import { createTranslator } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/types";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body: { messages?: unknown[]; locale?: string } = await request.json();
  const locale = isLocale(body.locale) ? body.locale : "nl";
  const t = createTranslator(locale);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: t("agentChat.apiKeyMissing") }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: t("agentChat.unauthorized") }, { status: 401 });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: t("agentChat.messagesMissing") }, { status: 400 });
    }

    const agent = createTicketIqAgent(supabase, user.id, locale);

    return createAgentUIStreamResponse({
      agent,
      uiMessages: body.messages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : t("agentChat.agentStartFailed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
