"use client";

import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { AgentChatMessages } from "@/components/features/analysis/agent-chat-messages";
import { AgentChatWelcome } from "@/components/features/analysis/agent-chat-welcome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useDashboardStats } from "@/hooks/useTickets";
import {
  ANALYZE_LIMIT_ALL,
  ANALYZE_LIMIT_OPTIONS,
  buildAnalyzePrompt,
  getAnalyzeLimitLabel,
  parseAnalyzeTicketLimit,
  type AnalyzeTicketLimit,
} from "@/lib/ai/analyzePrompt";

type AgentChatPanelProps = {
  displayName?: string;
};

export function AgentChatPanel({ displayName }: AgentChatPanelProps) {
  const [input, setInput] = useState("");
  const [ticketLimit, setTicketLimit] = useState<AnalyzeTicketLimit>(50);
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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Start analyse</CardTitle>
          <CardDescription>
            Kies hoeveel geïmporteerde tickets de agent analyseert en start de meerstaps-analyse.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <label htmlFor="ticket-limit" className="text-sm font-medium">
              Aantal tickets
            </label>
            <select
              id="ticket-limit"
              value={String(ticketLimit)}
              onChange={(event) => setTicketLimit(parseAnalyzeTicketLimit(event.target.value))}
              className="flex h-10 w-full min-w-[12rem] rounded-lg border border-input bg-background px-3 text-sm"
              disabled={isLoading || !hasTickets}
            >
              {ANALYZE_LIMIT_OPTIONS.map((limit) => (
                <option key={limit} value={limit}>
                  {getAnalyzeLimitLabel(limit)}
                </option>
              ))}
              <option value={ANALYZE_LIMIT_ALL}>
                {getAnalyzeLimitLabel(ANALYZE_LIMIT_ALL, stats?.tickets)}
              </option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 sm:self-end">
            <Button onClick={handleAnalyze} disabled={isLoading || !hasTickets}>
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
          <CardTitle className="text-base">AI-assistent</CardTitle>
          <CardDescription>
            Stel vragen over je tickets of start een analyse. Tool-stappen verschijnen hier
            tijdens het verwerken.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <AgentChatMessages
            messages={messages}
            isLoading={isLoading}
            emptyContent={
              <AgentChatWelcome
                displayName={displayName}
                hasTickets={hasTickets}
                isLoading={isLoading}
                onStartAnalyze={handleAnalyze}
              />
            }
          />

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Stel een vraag of geef een opdracht aan de AI-assistent…"
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
