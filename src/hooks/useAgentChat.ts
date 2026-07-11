"use client";

import { useChat } from "@ai-sdk/react";

import { useAgentChatContext } from "@/components/providers/agent-chat-provider";
import { clearAgentChatMessages } from "@/lib/ai/chatStorage";

/** Gedeelde agent-chat die behouden blijft bij navigatie tussen dashboard-pagina's. */
export function useAgentChat() {
  const { chat } = useAgentChatContext();
  const chatHelpers = useChat({ chat });

  function clearChat() {
    chatHelpers.setMessages([]);
    clearAgentChatMessages();
  }

  return { ...chatHelpers, clearChat };
}
