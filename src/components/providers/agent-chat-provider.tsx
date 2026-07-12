"use client";

import { Chat, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { AI_LIMITS } from "@/lib/ai/limits";
import { clearAgentChatMessages, loadAgentChatMessages, saveAgentChatMessages } from "@/lib/ai/chatStorage";
import { prepareAgentMessages } from "@/lib/ai/trim-messages";
import { getStoredLocale } from "@/lib/i18n/types";

type AgentChatContextValue = {
  chat: Chat<UIMessage>;
};

const AgentChatContext = createContext<AgentChatContextValue | null>(null);

function AgentChatPersistence({ chat }: { chat: Chat<UIMessage> }) {
  const { messages } = useChat({ chat });

  useEffect(() => {
    saveAgentChatMessages(prepareAgentMessages(messages) as typeof messages);
  }, [messages]);

  return null;
}

export function AgentChatProvider({ children }: { children: ReactNode }) {
  const chatRef = useRef<Chat<UIMessage> | null>(null);

  if (!chatRef.current) {
    chatRef.current = new Chat<UIMessage>({
      id: "ticketiq-analysis",
      messages: loadAgentChatMessages(),
      transport: new DefaultChatTransport({
        api: "/api/agent",
        body: () => ({ locale: getStoredLocale() }),
      }),
    });
  }

  const value = useMemo(
    () => ({
      chat: chatRef.current!,
    }),
    []
  );

  return (
    <AgentChatContext.Provider value={value}>
      <AgentChatPersistence chat={value.chat} />
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChatContext(): AgentChatContextValue {
  const context = useContext(AgentChatContext);

  if (!context) {
    throw new Error("useAgentChatContext moet binnen AgentChatProvider worden gebruikt");
  }

  return context;
}
