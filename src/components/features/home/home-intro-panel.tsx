"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useTickets";
import { getHomeNavActions } from "@/lib/home/nav-actions";
import { cn } from "@/lib/utils";

type HomeIntroPanelProps = {
  displayName?: string;
  className?: string;
};

export function HomeIntroPanel({ displayName, className }: HomeIntroPanelProps) {
  const { t, locale } = useLocale();
  const { data: stats } = useDashboardStats();
  const hasTickets = (stats?.tickets ?? 0) > 0;
  const navActions = getHomeNavActions(locale);

  return (
    <aside className={cn("flex w-full flex-col gap-8", className)}>
      <PageHeader
        eyebrow={t("home.eyebrow")}
        title={
          displayName ? t("home.welcomeNamed", { name: displayName }) : t("home.welcome")
        }
        description={t("home.introDescription")}
        className="w-full"
      />

      <nav aria-label={t("home.quickLinksAria")} className="flex w-full flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("home.quickLinks")}
        </p>
        <ul className="flex w-full flex-col gap-2">
          {navActions.map((action) => (
            <li key={action.href} className="w-full">
              <Link
                href={action.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "group flex h-full min-h-[4.5rem] w-full flex-row items-center gap-3 px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <action.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <span className="font-medium leading-snug">{action.label}</span>
                  <span className="text-xs font-normal leading-relaxed text-muted-foreground">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!hasTickets ? (
        <p className="w-full rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          {t("home.noTicketsWarning")}
        </p>
      ) : null}
    </aside>
  );
}
