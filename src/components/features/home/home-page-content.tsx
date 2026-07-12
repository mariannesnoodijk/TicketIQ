"use client";

import { AgentChatPanel } from "@/components/features/analysis/agent-chat-panel";
import { PageHeader } from "@/components/layout/page-header";

type HomePageContentProps = {
  displayName?: string;
};

export function HomePageContent({ displayName }: HomePageContentProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <PageHeader
        eyebrow="Home"
        title={displayName ? `Welkom terug, ${displayName}` : "Welkom terug"}
        description="Je AI-assistent voor supporttickets en helpcenter-artikelen. Start een analyse, stel een vraag of ga direct naar dashboard, tickets of helpcenter-artikelen."
      />

      <AgentChatPanel displayName={displayName} />
    </div>
  );
}
