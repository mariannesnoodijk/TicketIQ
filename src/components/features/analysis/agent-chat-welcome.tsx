"use client";

import { Bot, Sparkles } from "lucide-react";
import Link from "next/link";

import { useLocale } from "@/components/providers/locale-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { getHomeNavActions } from "@/lib/home/nav-actions";
import { cn } from "@/lib/utils";

type AgentChatWelcomeProps = {
  displayName?: string;
  hasTickets: boolean;
  isLoading: boolean;
  onStartAnalyze: () => void;
  sidePanelPresent?: boolean;
};

export function AgentChatWelcome({
  displayName,
  hasTickets,
  isLoading,
  onStartAnalyze,
  sidePanelPresent = false,
}: AgentChatWelcomeProps) {
  const { t, locale } = useLocale();
  const navActions = getHomeNavActions(locale);
  const greeting = displayName
    ? t("agentChat.welcomeNamed", { name: displayName })
    : t("agentChat.welcome");

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-primary/20 bg-accent/20 px-4 py-5">
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("agentChat.brand")}</p>
            <p className="mt-1 text-sm font-medium">{greeting}</p>
          </div>

          {sidePanelPresent ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("agentChat.welcomeSidePanel")}
            </p>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("agentChat.welcomeIntro")}
              </p>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">{t("agentChat.welcomeInChat")}</span>{" "}
                  {t("agentChat.welcomeInChatDesc")}
                </li>
                <li>
                  <span className="font-medium text-foreground">{t("agentChat.welcomeDashboard")}</span>{" "}
                  {t("agentChat.welcomeDashboardDesc")}
                </li>
                <li>
                  <span className="font-medium text-foreground">{t("agentChat.welcomeManage")}</span>{" "}
                  {t("agentChat.welcomeManageDesc")}
                </li>
              </ul>
            </>
          )}

          {!hasTickets ? (
            <p
              className={cn(
                "rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground",
                sidePanelPresent && "lg:hidden"
              )}
            >
              {t("home.noTicketsWarning")}
            </p>
          ) : null}
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-2 pl-11", sidePanelPresent && "lg:hidden")}>
        {navActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-auto gap-2 px-3 py-2"
            )}
          >
            <action.icon className="size-4 shrink-0" aria-hidden />
            <span>{action.label}</span>
          </Link>
        ))}

        {hasTickets ? (
          <Button size="sm" onClick={onStartAnalyze} disabled={isLoading} className="gap-2">
            <Sparkles className="size-4" aria-hidden />
            {t("agentChat.startAnalysis")}
          </Button>
        ) : (
          <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
            {t("agentChat.importTickets")}
          </Link>
        )}
      </div>
    </div>
  );
}
