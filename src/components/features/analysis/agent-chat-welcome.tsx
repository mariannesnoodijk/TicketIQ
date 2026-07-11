"use client";

import { BarChart3, Bot, FileText, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AgentChatWelcomeProps = {
  displayName?: string;
  hasTickets: boolean;
  isLoading: boolean;
  onStartAnalyze: () => void;
};

const NAV_ACTIONS = [
  {
    href: "/dashboard",
    label: "Dashboard bekijken",
    description: "Statistieken en trends",
    icon: BarChart3,
  },
  {
    href: "/dashboard/tickets",
    label: "Tickets bekijken",
    description: "Overzicht en filters",
    icon: Ticket,
  },
  {
    href: "/dashboard/suggestions",
    label: "Helpcenter-artikelen",
    description: "AI-voorstellen beheren",
    icon: FileText,
  },
] as const;

export function AgentChatWelcome({
  displayName,
  hasTickets,
  isLoading,
  onStartAnalyze,
}: AgentChatWelcomeProps) {
  const greeting = displayName ? `Hoi ${displayName}!` : "Welkom bij TicketIQ!";

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-primary/20 bg-accent/20 px-4 py-5">
      <div className="flex gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">TicketIQ AI</p>
            <p className="mt-1 text-sm font-medium">{greeting}</p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Ik help je supporttickets te analyseren en AI-helpcenter-artikelen voor te stellen.
            Dit kun je doen:
          </p>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">In deze chat:</span> tickets
              analyseren, patronen vinden en helpcenter-artikelen laten genereren
            </li>
            <li>
              <span className="font-medium text-foreground">Dashboard:</span> statistieken en
              trends bekijken
            </li>
            <li>
              <span className="font-medium text-foreground">Tickets &amp; helpcenter:</span>{" "}
              resultaten beheren en goedkeuren
            </li>
          </ul>

          {!hasTickets ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-muted-foreground">
              Je hebt nog geen tickets. Importeer eerst tickets via het dashboard voordat je een
              analyse start.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pl-11">
        {NAV_ACTIONS.map((action) => (
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
            Start analyse
          </Button>
        ) : (
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            Tickets importeren
          </Link>
        )}
      </div>
    </div>
  );
}
