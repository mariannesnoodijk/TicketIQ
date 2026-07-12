import { createAgentUIStreamResponse } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createTicketIqAgent } from "@/lib/ai/agent";
import { createOffTopicDeclineResponse } from "@/lib/ai/off-topic-response";
import {
  extractLastUserMessageText,
  getOffTopicDeclineMessage,
  isClearlyOffTopicMessage,
} from "@/lib/ai/topic-guard";
import { AI_LIMITS } from "@/lib/ai/limits";
import { checkAiRateLimit } from "@/lib/ai/rate-limit";
import { prepareAgentMessages } from "@/lib/ai/trim-messages";
import { parseJsonBody } from "@/lib/api/parse-json-body";
import { createTranslator } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/types";
import { createClient } from "@/lib/supabase/server";

const agentBodySchema = z.object({
  locale: z.string().optional(),
  messages: z
    .array(z.record(z.string(), z.unknown()))
    .min(1)
    .max(AI_LIMITS.maxChatMessages),
});

export async function POST(request: Request) {
  const parsed = await parseJsonBody<{ messages?: unknown[]; locale?: string }>(request);

  if (!parsed.ok) {
    const t = createTranslator("nl");
    return NextResponse.json({ error: t("agentChat.invalidJson") }, { status: 400 });
  }

  const locale = isLocale(parsed.body.locale) ? parsed.body.locale : "nl";
  const t = createTranslator(locale);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: t("agentChat.apiKeyMissing") }, { status: 503 });
  }

  try {
    const validated = agentBodySchema.safeParse(parsed.body);

    if (!validated.success) {
      return NextResponse.json({ error: t("agentChat.messagesMissing") }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: t("agentChat.unauthorized") }, { status: 401 });
    }

    const uiMessages = prepareAgentMessages(validated.data.messages);
    const lastUserMessage = extractLastUserMessageText(uiMessages);

    if (lastUserMessage && isClearlyOffTopicMessage(lastUserMessage)) {
      return createOffTopicDeclineResponse(
        getOffTopicDeclineMessage(locale),
        uiMessages
      );
    }

    const rateLimit = checkAiRateLimit(user.id, "agent");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: t("agentChat.rateLimited", {
            minutes: Math.ceil(rateLimit.retryAfterSec / 60),
          }),
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSec) },
        }
      );
    }

    const agent = createTicketIqAgent(supabase, user.id, locale);

    return createAgentUIStreamResponse({
      agent,
      uiMessages,
    });
  } catch (error) {
    console.error("[agent] POST failed:", error);
    return NextResponse.json({ error: t("agentChat.agentStartFailed") }, { status: 500 });
  }
}
