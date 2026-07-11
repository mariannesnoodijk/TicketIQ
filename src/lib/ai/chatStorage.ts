import type { UIMessage } from "ai";

const STORAGE_KEY = "ticketiq:agent-chat:v1";

export function loadAgentChatMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveAgentChatMessages(messages: UIMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Quota exceeded of storage uitgeschakeld — negeer stilletjes.
  }
}

export function clearAgentChatMessages(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
