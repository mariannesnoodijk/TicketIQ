"use client";

import type { ReactNode } from "react";

import { SessionTimeoutGuard } from "@/components/features/auth/session-timeout-guard";
import { AgentChatProvider } from "@/components/providers/agent-chat-provider";

export function AppLayoutShell({ children }: { children: ReactNode }) {
  return (
    <AgentChatProvider>
      <SessionTimeoutGuard />
      {children}
    </AgentChatProvider>
  );
}
