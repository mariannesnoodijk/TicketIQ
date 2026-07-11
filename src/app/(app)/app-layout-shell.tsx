"use client";

import type { ReactNode } from "react";

import { AgentChatProvider } from "@/components/providers/agent-chat-provider";

export function AppLayoutShell({ children }: { children: ReactNode }) {
  return <AgentChatProvider>{children}</AgentChatProvider>;
}
