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
    <aside className={cn("flex w-full flex-col gap-8", className)}>
      <PageHeader
        eyebrow="Home"
        title={displayName ? `Welkom terug, ${displayName}` : "Welkom terug"}
        description="Je AI-assistent voor supporttickets en helpcenter-artikelen. Stel vragen, start een analyse of ga direct naar een onderdeel."
        className="w-full"
      />

      <nav aria-label="Snelle links" className="flex w-full flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Snel naar
        </p>
        <ul className="flex w-full flex-col gap-2">
          {HOME_NAV_ACTIONS.map((action) => (
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
          Je hebt nog geen tickets. Importeer eerst tickets via het dashboard voordat je een
          analyse start.
        </p>
      ) : null}
    </aside>
  );
}
