"use client";

import type { UIMessage } from "ai";
import { isToolUIPart } from "ai";
import { Bot, ChevronDown, Loader2, User, Wrench } from "lucide-react";
import type { ReactNode } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import {
  agentToolLabel,
  agentToolStateLabel,
} from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

type IndexedPart = {
  part: UIMessage["parts"][number];
  index: number;
};

type MessageSegment =
  | { kind: "text"; part: Extract<UIMessage["parts"][number], { type: "text" }>; index: number }
  | { kind: "tools"; parts: IndexedPart[] };

function isToolRunning(state: string): boolean {
  return state === "input-streaming" || state === "input-available";
}

function getToolDetailContent(
  part: UIMessage["parts"][number],
  t: ReturnType<typeof useLocale>["t"]
): string | null {
  if (!isToolUIPart(part)) {
    return null;
  }

  if (part.state === "output-error" && "errorText" in part && part.errorText) {
    return part.errorText;
  }

  const output = "output" in part ? part.output : undefined;
  if (part.state === "output-available" && output && typeof output === "object") {
    const toolName = part.type.replace("tool-", "");

    if (
      toolName === "fetchTickets" &&
      "count" in output &&
      typeof output.count === "number" &&
      "source" in output &&
      (output.source === "database" || output.source === "api")
    ) {
      const sourceLabel =
        output.source === "api" ? t("agentChat.sourceApi") : t("agentChat.sourceDatabase");
      const key =
        output.count === 1 ? "agentChat.fetchResult" : "agentChat.fetchResultPlural";
      return t(key, { count: output.count, source: sourceLabel });
    }

    if ("message" in output && typeof output.message === "string") {
      return output.message;
    }
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

function ToolMessageHeader({
  toolName,
  state,
  output,
}: {
  toolName: string;
  state: string;
  output: unknown;
}) {
  const { t, locale } = useLocale();
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
      <span className="font-medium">{agentToolLabel(toolName, locale)}</span>
      <Badge variant="outline" className="text-xs">
        {agentToolStateLabel(state, locale)}
      </Badge>
      {saved ? <Badge className="text-xs">{t("agentChat.saved")}</Badge> : null}
      {categorized ? <Badge className="text-xs">{t("agentChat.categorized")}</Badge> : null}
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
  const { t } = useLocale();

  if (!isToolUIPart(part)) {
    return null;
  }

  const toolName = part.type.replace("tool-", "");
  const output = "output" in part ? part.output : undefined;
  const state = part.state;
  const running = isToolRunning(state);
  const detailContent = getToolDetailContent(part, t);
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
  const { t } = useLocale();
  const anyRunning = parts.some(
    ({ part }) => isToolUIPart(part) && isToolRunning(part.state)
  );
  const hasError = parts.some(
    ({ part }) => isToolUIPart(part) && part.state === "output-error"
  );

  const summaryLabel = anyRunning
    ? parts.length === 1
      ? t("agentChat.toolStepInProgress")
      : t("agentChat.toolStepsInProgress", { count: parts.length })
    : hasError
      ? t("agentChat.toolStepsDoneWithError", {
          label:
            parts.length === 1
              ? t("agentChat.toolStepDone")
              : t("agentChat.toolStepsDone", { count: parts.length }),
        })
      : parts.length === 1
        ? t("agentChat.toolStepDone")
        : t("agentChat.toolStepsDone", { count: parts.length });

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
        <span className="font-medium">{summaryLabel}</span>
        {hasError ? (
          <Badge variant="outline" className="text-xs text-destructive">
            {t("agentChat.stateError")}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            {t("agentChat.stateDone")}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{t("agentChat.clickForDetails")}</span>
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
  variant,
}: {
  part: Extract<UIMessage["parts"][number], { type: "text" }>;
  messageId: string;
  index: number;
  variant: "user" | "assistant";
}) {
  if (!part.text.trim()) {
    return null;
  }

  return (
    <p
      key={`${messageId}-${index}`}
      className={cn(
        "whitespace-pre-wrap text-sm leading-relaxed",
        variant === "user"
          ? "rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-primary-foreground shadow-sm"
          : "text-foreground"
      )}
    >
      {part.text}
    </p>
  );
}

function UserChatMessage({ message }: { message: UIMessage }) {
  const { t } = useLocale();
  const textParts = message.parts.filter(
    (part): part is Extract<UIMessage["parts"][number], { type: "text" }> =>
      part.type === "text" && part.text.trim().length > 0
  );

  if (textParts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-end justify-end gap-2.5">
      <div className="max-w-[min(85%,34rem)] space-y-1">
        <p className="text-right text-xs font-medium text-muted-foreground">{t("agentChat.you")}</p>
        <div className="space-y-2">
          {textParts.map((part, index) => (
            <TextMessagePart
              key={`${message.id}-text-${index}`}
              part={part}
              messageId={message.id}
              index={index}
              variant="user"
            />
          ))}
        </div>
      </div>
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
        aria-hidden
      >
        <User className="size-4" aria-hidden="true" />
      </div>
    </div>
  );
}

function AssistantChatMessage({ message }: { message: UIMessage }) {
  const { t } = useLocale();
  const segments = orderSegmentsForDisplay(segmentMessageParts(message.parts), true);

  return (
    <div className="flex gap-2.5">
      <div
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        aria-hidden
      >
        <Bot className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-2 rounded-xl border border-primary/15 bg-muted/50 px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-primary">{t("agentChat.brand")}</p>
        {segments.map((segment, segmentIndex) => {
          if (segment.kind === "text") {
            return (
              <TextMessagePart
                key={`${message.id}-text-${segment.index}`}
                part={segment.part}
                messageId={message.id}
                index={segment.index}
                variant="assistant"
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

function ChatMessage({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    return <UserChatMessage message={message} />;
  }

  return <AssistantChatMessage message={message} />;
}

type AgentChatMessagesProps = {
  messages: UIMessage[];
  isLoading: boolean;
  emptyContent?: ReactNode;
};

export function AgentChatMessages({ messages, isLoading, emptyContent }: AgentChatMessagesProps) {
  const { t } = useLocale();

  if (messages.length === 0 && !isLoading) {
    if (emptyContent) {
      return <div className="flex flex-1 flex-col">{emptyContent}</div>;
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <Bot className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">{t("agentChat.noMessages")}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t("agentChat.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading ? (
        <div className="flex gap-2.5">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          </div>
          <div className="rounded-xl border border-primary/15 bg-muted/50 px-4 py-3 text-sm text-muted-foreground shadow-sm">
            {t("agentChat.analyzingProgress")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
