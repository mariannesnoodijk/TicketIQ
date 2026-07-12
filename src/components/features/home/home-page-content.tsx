"use client";

import { AgentChatPanel } from "@/components/features/analysis/agent-chat-panel";
import { HomeIntroPanel } from "@/components/features/home/home-intro-panel";
import { PageHeader } from "@/components/layout/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { Reveal } from "@/components/ui/reveal";

type HomePageContentProps = {
  displayName?: string;
};

export function HomePageContent({ displayName }: HomePageContentProps) {
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10">
      <Reveal className="mb-6 lg:hidden">
        <PageHeader
          eyebrow={t("home.eyebrow")}
          title={
            displayName ? t("home.welcomeNamed", { name: displayName }) : t("home.welcome")
          }
          description={t("home.description")}
        />
      </Reveal>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <Reveal delay={80} className="hidden h-full lg:block">
          <HomeIntroPanel displayName={displayName} className="h-full" />
        </Reveal>

        <Reveal delay={160}>
          <AgentChatPanel displayName={displayName} sidePanelPresent />
        </Reveal>
      </div>
    </div>
  );
}
