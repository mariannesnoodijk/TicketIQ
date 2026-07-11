import { createAgentUIStreamResponse } from "ai";
import { NextResponse } from "next/server";

import { createTicketIqAgent } from "@/lib/ai/agent";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

    const body: { messages?: unknown[] } = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Berichten ontbreken" }, { status: 400 });
    }

    const agent = createTicketIqAgent(supabase, user.id);

    return createAgentUIStreamResponse({
      agent,
      uiMessages: body.messages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI-agent kon niet worden gestart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
