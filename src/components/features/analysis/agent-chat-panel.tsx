"use client";

import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { AgentChatMessages } from "@/components/features/analysis/agent-chat-messages";
import { AgentChatWelcome } from "@/components/features/analysis/agent-chat-welcome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatPanelSkeleton } from "@/components/ui/content-skeletons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  sidePanelPresent?: boolean;
};

type AnalyzeToolbarProps = {
  ticketLimit: AnalyzeTicketLimit;
  onTicketLimitChange: (limit: AnalyzeTicketLimit) => void;
  onAnalyze: () => void;
  onClearChat: () => void;
  isLoading: boolean;
  hasTickets: boolean;
  hasMessages: boolean;
  ticketCount?: number;
  compact?: boolean;
};

function AnalyzeToolbar({
  ticketLimit,
  onTicketLimitChange,
  onAnalyze,
  onClearChat,
  isLoading,
  hasTickets,
  hasMessages,
  ticketCount,
  compact = false,
}: AnalyzeToolbarProps) {
  return (
    <div
      className={
        compact
          ? "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
          : "flex flex-col gap-4 sm:flex-row sm:items-end"
      }
    >
      <div className={compact ? "flex min-w-0 flex-1 items-center gap-2 sm:flex-initial" : "space-y-2"}>
        {!compact ? (
          <label htmlFor="ticket-limit" className="text-sm font-medium">
            Aantal tickets
          </label>
        ) : null}
        <Select
          id="ticket-limit"
          value={String(ticketLimit)}
          onChange={(event) => onTicketLimitChange(parseAnalyzeTicketLimit(event.target.value))}
          className={compact ? "min-w-0 flex-1 sm:min-w-40" : "min-w-48"}
          disabled={isLoading || !hasTickets}
          aria-label="Aantal tickets voor analyse"
        >
          {ANALYZE_LIMIT_OPTIONS.map((limit) => (
            <option key={limit} value={limit}>
              {getAnalyzeLimitLabel(limit)}
            </option>
          ))}
          <option value={ANALYZE_LIMIT_ALL}>
            {getAnalyzeLimitLabel(ANALYZE_LIMIT_ALL, ticketCount)}
          </option>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2 sm:self-end">
        <Button
          onClick={onAnalyze}
          disabled={isLoading || !hasTickets}
          size={compact ? "sm" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Analyseren…
            </>
          ) : (
            <>
              <Sparkles className="size-4" aria-hidden="true" />
              {compact ? "Analyseer" : "Analyseer tickets"}
            </>
          )}
        </Button>
        {hasMessages ? (
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={onClearChat}
            disabled={isLoading}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {compact ? "Wissen" : "Nieuwe analyse"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function AgentChatPanel({ displayName, sidePanelPresent = false }: AgentChatPanelProps) {
  const [input, setInput] = useState("");
  const [ticketLimit, setTicketLimit] = useState<AnalyzeTicketLimit>(50);
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();

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

  if (isStatsLoading) {
    return <ChatPanelSkeleton />;
  }

  return (
    <Card className="flex min-h-[32rem] flex-col lg:min-h-[36rem]">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">AI-assistent</CardTitle>
            <CardDescription className="mt-1">
              Stel vragen over je tickets of start een analyse. Tool-stappen verschijnen tijdens het
              verwerken.
            </CardDescription>
          </div>
          <AnalyzeToolbar
            ticketLimit={ticketLimit}
            onTicketLimitChange={setTicketLimit}
            onAnalyze={handleAnalyze}
            onClearChat={handleClearChat}
            isLoading={isLoading}
            hasTickets={hasTickets}
            hasMessages={hasMessages}
            ticketCount={stats?.tickets}
            compact
          />
        </div>
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
              sidePanelPresent={sidePanelPresent}
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
  );
}
