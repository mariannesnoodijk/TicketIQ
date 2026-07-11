"use client";

import type { UIMessage } from "ai";
import { isToolUIPart } from "ai";
import { Bot, ChevronDown, Loader2, User, Wrench } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, string> = {
  fetchTickets: "Tickets ophalen (DummyJSON)",
  assignTicketCategory: "Tickets categoriseren",
  findExistingSuggestions: "Duplicaatcheck",
  saveSuggestion: "Suggestie opslaan",
};

type IndexedPart = {
  part: UIMessage["parts"][number];
  index: number;
};

type MessageSegment =
  | { kind: "text"; part: Extract<UIMessage["parts"][number], { type: "text" }>; index: number }
  | { kind: "tools"; parts: IndexedPart[] };

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

function isToolRunning(state: string): boolean {
  return state === "input-streaming" || state === "input-available";
}

function getToolDetailContent(part: UIMessage["parts"][number]): string | null {
  if (!isToolUIPart(part)) {
    return null;
  }

  if (part.state === "output-error" && "errorText" in part && part.errorText) {
    return part.errorText;
  }

  const output = "output" in part ? part.output : undefined;
  if (
    part.state === "output-available" &&
    output &&
    typeof output === "object" &&
    "message" in output &&
    typeof output.message === "string"
  ) {
    return output.message;
  }

  return null;
}

function segmentMessageParts(parts: UIMessage["parts"]): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let currentToolGroup: IndexedPart[] | null = null;

  for (const [index, part] of parts.entries()) {
    if (isToolUIPart(part)) {
      if (!currentToolGroup) {
        currentToolGroup = [];
        segments.push({ kind: "tools", parts: currentToolGroup });
      }
      currentToolGroup.push({ part, index });
      continue;
    }

    currentToolGroup = null;
    if (part.type === "text") {
      segments.push({ kind: "text", part, index });
    }
  }

  return segments;
}

/** Toon antwoord vóór ingeklapte tool-stappen zodat de gebruiker niet hoeft te scrollen. */
function orderSegmentsForDisplay(segments: MessageSegment[], isAssistant: boolean): MessageSegment[] {
  if (!isAssistant) {
    return segments;
  }

  const textSegments = segments.filter((segment) => segment.kind === "text");
  const toolSegments = segments.filter((segment) => segment.kind === "tools");

  if (textSegments.length === 0 || toolSegments.length === 0) {
    return segments;
  }

  return [...textSegments, ...toolSegments];
}

function formatToolGroupSummary(count: number, hasError: boolean, anyRunning: boolean): string {
  if (anyRunning) {
    return count === 1 ? "AI-stap bezig…" : `${count} AI-stappen bezig…`;
  }

  const stepLabel = count === 1 ? "AI-stap uitgevoerd" : `${count} AI-stappen uitgevoerd`;
  return hasError ? `${stepLabel} (met fout)` : stepLabel;
}

function ToolMessageHeader({
  toolName,
  state,
  output,
}: {
  toolName: string;
  state: string;
  output: unknown;
}) {
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
  const running = isToolRunning(state);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {running ? (
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
      ) : (
        <Wrench className="size-3.5 text-muted-foreground" aria-hidden />
      )}
      <span className="font-medium">{getToolLabel(toolName)}</span>
      <Badge variant="outline" className="text-xs">
        {getToolStateLabel(state)}
      </Badge>
      {saved ? <Badge className="text-xs">Opgeslagen</Badge> : null}
      {categorized ? <Badge className="text-xs">Gecategoriseerd</Badge> : null}
    </div>
  );
}

function ToolMessagePart({
  part,
  messageId,
  index,
}: {
  part: UIMessage["parts"][number];
  messageId: string;
  index: number;
}) {
  if (!isToolUIPart(part)) {
    return null;
  }

  const toolName = part.type.replace("tool-", "");
  const output = "output" in part ? part.output : undefined;
  const state = part.state;
  const running = isToolRunning(state);
  const detailContent = getToolDetailContent(part);
  const isCollapsible = state === "output-available" && detailContent !== null;

  if (running) {
    return (
      <div
        key={`${messageId}-${index}`}
        className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
      >
        <ToolMessageHeader toolName={toolName} state={state} output={output} />
      </div>
    );
  }

  if (!isCollapsible) {
    return (
      <div
        key={`${messageId}-${index}`}
        className={cn(
          "rounded-lg border px-3 py-2 text-sm",
          state === "output-error"
            ? "border-destructive/30 bg-destructive/5"
            : "border-border bg-muted/40"
        )}
      >
        <ToolMessageHeader toolName={toolName} state={state} output={output} />
        {detailContent ? (
          <p
            className={cn(
              "mt-1 text-xs",
              state === "output-error" ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {detailContent}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <details
      key={`${messageId}-${index}-${state}`}
      className="group/step rounded-lg border border-border bg-muted/40 text-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 [&::-webkit-details-marker]:hidden">
        <ToolMessageHeader toolName={toolName} state={state} output={output} />
        <ChevronDown
          className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-open/step:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        {detailContent}
      </div>
    </details>
  );
}

function ToolStepsGroup({ parts, messageId }: { parts: IndexedPart[]; messageId: string }) {
  const anyRunning = parts.some(
    ({ part }) => isToolUIPart(part) && isToolRunning(part.state)
  );
  const hasError = parts.some(
    ({ part }) => isToolUIPart(part) && part.state === "output-error"
  );

  if (anyRunning) {
    return (
      <div className="space-y-2">
        {parts.map(({ part, index }) => (
          <ToolMessagePart key={`${messageId}-${index}`} part={part} messageId={messageId} index={index} />
        ))}
      </div>
    );
  }

  return (
    <details
      key={`${messageId}-tool-group-complete`}
      className="group/tools rounded-lg border border-border bg-muted/30 text-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <Wrench className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-medium">{formatToolGroupSummary(parts.length, hasError, false)}</span>
        {hasError ? (
          <Badge variant="outline" className="text-xs text-destructive">
            Fout
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            Klaar
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">Klik voor details</span>
        <ChevronDown
          className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-open/tools:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="space-y-2 border-t border-border px-3 py-3">
        {parts.map(({ part, index }) => (
          <ToolMessagePart key={`${messageId}-${index}`} part={part} messageId={messageId} index={index} />
        ))}
      </div>
    </details>
  );
}

function TextMessagePart({
  part,
  messageId,
  index,
}: {
  part: Extract<UIMessage["parts"][number], { type: "text" }>;
  messageId: string;
  index: number;
}) {
  if (!part.text.trim()) {
    return null;
  }

  return (
    <p key={`${messageId}-${index}`} className="whitespace-pre-wrap text-sm leading-relaxed">
      {part.text}
    </p>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const segments = orderSegmentsForDisplay(segmentMessageParts(message.parts), !isUser);

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
        {segments.map((segment, segmentIndex) => {
          if (segment.kind === "text") {
            return (
              <TextMessagePart
                key={`${message.id}-text-${segment.index}`}
                part={segment.part}
                messageId={message.id}
                index={segment.index}
              />
            );
          }

          return (
            <ToolStepsGroup
              key={`${message.id}-tools-${segmentIndex}`}
              parts={segment.parts}
              messageId={message.id}
            />
          );
        })}
      </div>
    </div>
  );
}

type AgentChatMessagesProps = {
  messages: UIMessage[];
  isLoading: boolean;
  emptyContent?: ReactNode;
};

export function AgentChatMessages({ messages, isLoading, emptyContent }: AgentChatMessagesProps) {
  if (messages.length === 0 && !isLoading) {
    if (emptyContent) {
      return <div className="flex flex-1 flex-col">{emptyContent}</div>;
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <Bot className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Nog geen berichten</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Start een analyse of stel een vraag aan de AI-assistent.
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
