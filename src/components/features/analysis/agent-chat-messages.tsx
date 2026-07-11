"use client";

import type { UIMessage } from "ai";
import { isToolUIPart } from "ai";
import { Bot, Loader2, User, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  fetchTickets: "Tickets ophalen (DummyJSON)",
  assignTicketCategory: "Tickets categoriseren",
  findExistingSuggestions: "Duplicaatcheck",
  saveSuggestion: "Suggestie opslaan",
};

function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? toolName;
}

function getToolStateLabel(state: string): string {
  switch (state) {
    case "input-streaming":
      return "Bezig…";
    case "input-available":
      return "Uitvoeren…";
    case "output-available":
      return "Klaar";
    case "output-error":
      return "Fout";
    default:
      return state;
  }
}

function MessagePart({ part, messageId, index }: { part: UIMessage["parts"][number]; messageId: string; index: number }) {
  if (part.type === "text") {
    return (
      <p key={`${messageId}-${index}`} className="whitespace-pre-wrap text-sm leading-relaxed">
        {part.text}
      </p>
    );
  }

  if (isToolUIPart(part)) {
    const toolName = part.type.replace("tool-", "");
    const output = "output" in part ? part.output : undefined;
    const saved =
      toolName === "saveSuggestion" &&
      output &&
      typeof output === "object" &&
      "saved" in output &&
      output.saved === true;
    const categorized =
      toolName === "assignTicketCategory" &&
      output &&
      typeof output === "object" &&
      "updated" in output &&
      typeof output.updated === "number" &&
      output.updated > 0;

    return (
      <div
        key={`${messageId}-${index}`}
        className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Wrench className="size-3.5 text-muted-foreground" />
          <span className="font-medium">{getToolLabel(toolName)}</span>
          <Badge variant="outline" className="text-xs">
            {getToolStateLabel(part.state)}
          </Badge>
          {saved ? (
            <Badge className="text-xs">Opgeslagen</Badge>
          ) : null}
          {categorized ? (
            <Badge className="text-xs">Gecategoriseerd</Badge>
          ) : null}
        </div>
        {part.state === "output-error" && "errorText" in part ? (
          <p className="mt-1 text-xs text-destructive">{part.errorText}</p>
        ) : null}
        {part.state === "output-available" &&
        output &&
        typeof output === "object" &&
        "message" in output &&
        typeof output.message === "string" ? (
          <p className="mt-1 text-xs text-muted-foreground">{output.message}</p>
        ) : null}
      </div>
    );
  }

  return null;
}

function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3",
        isUser ? "border-border bg-card" : "border-primary/20 bg-accent/30"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-muted" : "bg-primary/10 text-primary"
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? "Jij" : "TicketIQ AI"}
        </p>
        {message.parts.map((part, index) => (
          <MessagePart key={`${message.id}-${index}`} part={part} messageId={message.id} index={index} />
        ))}
      </div>
    </div>
  );
}

type AgentChatMessagesProps = {
  messages: UIMessage[];
  isLoading: boolean;
};

export function AgentChatMessages({ messages, isLoading }: AgentChatMessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <Bot className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Nog geen analyse gestart</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Klik op &quot;Analyseer tickets&quot; om de AI-agent te starten, of stel een vraag over
          je supporttickets.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading ? (
        <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Agent analyseert…
        </div>
      ) : null}
    </div>
  );
}
