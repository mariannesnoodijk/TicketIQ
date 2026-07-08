import { NextResponse } from "next/server";

/**
 * AI Agent API route (placeholder).
 *
 * TODO (Deelopdracht 1): implementeer de agent-based flow met de Vercel AI SDK:
 *   - streamText/generateText met tools en maxSteps
 *   - tool calling naar de externe API
 *   - streaming response terug naar de chat-interface
 *
 * Installeer de dependencies zodra je begint:
 *   npm install ai @ai-sdk/react @ai-sdk/openai
 */
export async function POST() {
  return NextResponse.json(
    { error: "AI-agent is nog niet geïmplementeerd." },
    { status: 501 }
  );
}
