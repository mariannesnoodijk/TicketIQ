"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useTickets";
import { HOME_NAV_ACTIONS } from "@/lib/home/nav-actions";
import { cn } from "@/lib/utils";

type HomeIntroPanelProps = {
  displayName?: string;
  className?: string;
};

export function HomeIntroPanel({ displayName, className }: HomeIntroPanelProps) {
  const { data: stats } = useDashboardStats();
  const hasTickets = (stats?.tickets ?? 0) > 0;

  return (
    <aside className={cn("flex flex-col gap-6", className)}>
      <PageHeader
        eyebrow="Home"
        title={displayName ? `Welkom terug, ${displayName}` : "Welkom terug"}
        description="Je AI-assistent voor supporttickets en helpcenter-artikelen. Stel vragen, start een analyse of ga direct naar een onderdeel."
      />

      <nav aria-label="Snelle links" className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Snel naar
        </p>
        {HOME_NAV_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-col items-start gap-1 px-4 py-3"
            )}
          >
            <span className="font-medium">{action.label}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {action.description}
            </span>
          </Link>
        ))}
      </nav>

      {!hasTickets ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
          Je hebt nog geen tickets. Importeer eerst tickets via het dashboard voordat je een
          analyse start.
        </p>
      ) : null}
    </aside>
  );
}
