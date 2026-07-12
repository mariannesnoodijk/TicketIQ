"use client";

import { AgentChatPanel } from "@/components/features/analysis/agent-chat-panel";

type HomePageContentProps = {
  displayName?: string;
};

export function HomePageContent({ displayName }: HomePageContentProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Home</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {displayName ? `Welkom terug, ${displayName}` : "Welkom terug"}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Je AI-assistent voor supporttickets en helpcenter-artikelen. Start een analyse, stel een
          vraag of ga direct naar dashboard, tickets of helpcenter-artikelen.
        </p>
      </div>

      <AgentChatPanel displayName={displayName} />
    </div>
  );
}
