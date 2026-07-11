"use client";

import { Loader2, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AgentChatMessages } from "@/components/features/analysis/agent-chat-messages";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useDashboardStats } from "@/hooks/useTickets";
import { cn } from "@/lib/utils";

const LIMIT_OPTIONS = [50, 100] as const;

function buildAnalyzePrompt(limit: number): string {
  return `Analyseer de laatste ${limit} supporttickets. Zoek terugkerende patronen, categoriseer de tickets met assignTicketCategory, controleer op duplicaten en sla maximaal 5 nieuwe helpcenter-suggesties op. Leg daarna uit wat je hebt gevonden.`;
}

export function AnalyzePageContent() {
  const [input, setInput] = useState("");
  const [ticketLimit, setTicketLimit] = useState<(typeof LIMIT_OPTIONS)[number]>(50);
  const { data: stats } = useDashboardStats();

  const { messages, sendMessage, status, error, clearChat } = useAgentChat();

  const isLoading = status === "streaming" || status === "submitted";
  const hasTickets = (stats?.tickets ?? 0) > 0;
  const hasMessages = messages.length > 0;

  function handleAnalyze() {
    void sendMessage({ text: buildAnalyzePrompt(ticketLimit) });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    void sendMessage({ text: trimmed });
    setInput("");
  }

  function handleClearChat() {
    if (!hasMessages) return;
    if (confirm("Chatgeschiedenis wissen en opnieuw beginnen?")) {
      clearChat();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">AI-analyse</h1>
        <p className="text-muted-foreground">
          De agent haalt tickets op via DummyJSON, categoriseert ze, detecteert terugkerende
          problemen en genereert helpcenter-suggesties. De chat blijft bewaard bij navigatie.
        </p>
      </div>

      {!hasTickets ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Geen tickets gevonden</CardTitle>
            <CardDescription>
              Importeer eerst tickets zodat de agent je dataset kent. De analyse haalt daarnaast
              ook live data op via DummyJSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Ga naar dashboard om te importeren
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Start analyse</CardTitle>
          <CardDescription>
            Kies hoeveel tickets de agent ophaalt en start de meerstaps-analyse.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <label htmlFor="ticket-limit" className="text-sm font-medium">
              Aantal tickets
            </label>
            <select
              id="ticket-limit"
              value={ticketLimit}
              onChange={(event) =>
                setTicketLimit(Number(event.target.value) as (typeof LIMIT_OPTIONS)[number])
              }
              className="flex h-10 w-full min-w-[8rem] rounded-lg border border-input bg-background px-3 text-sm"
              disabled={isLoading}
            >
              {LIMIT_OPTIONS.map((limit) => (
                <option key={limit} value={limit}>
                  {limit} tickets
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 sm:self-end">
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyseren…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Analyseer tickets
                </>
              )}
            </Button>
            {hasMessages ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearChat}
                disabled={isLoading}
              >
                <Trash2 className="size-4" />
                Nieuwe analyse
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-[28rem] flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Analyse &amp; chat</CardTitle>
          <CardDescription>
            Streaming antwoord met zichtbare tool-calls (ophalen, categoriseren, duplicaatcheck,
            opslaan). Blijft bewaard bij tabwissel en pagina-refresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <AgentChatMessages messages={messages} isLoading={isLoading} />

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Stel een vervolgvraag over de analyse…"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" variant="outline" disabled={isLoading || !input.trim()}>
              Verstuur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
