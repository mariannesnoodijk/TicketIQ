"use client";

import { AgentChatPanel } from "@/components/features/analysis/agent-chat-panel";
import { HomeIntroPanel } from "@/components/features/home/home-intro-panel";
import { PageHeader } from "@/components/layout/page-header";

type HomePageContentProps = {
  displayName?: string;
};

export function HomePageContent({ displayName }: HomePageContentProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10">
      <div className="mb-6 lg:hidden">
        <PageHeader
          eyebrow="Home"
          title={displayName ? `Welkom terug, ${displayName}` : "Welkom terug"}
          description="Je AI-assistent voor supporttickets en helpcenter-artikelen."
        />
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <HomeIntroPanel displayName={displayName} className="hidden lg:flex" />

        <AgentChatPanel displayName={displayName} sidePanelPresent />
      </div>
    </div>
  );
}
