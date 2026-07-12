import { enMessages } from "@/lib/i18n/messages/en";
import { nlMessages, type Messages } from "@/lib/i18n/messages/nl";
import type { Locale } from "@/lib/i18n/types";

export const messages: Record<Locale, Messages> = {
  nl: nlMessages,
  en: enMessages,
};

export type MessageKey = {
  [Section in keyof Messages]: `${Section & string}.${keyof Messages[Section] & string}`;
}[keyof Messages];

function resolveMessage(dict: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = dict;

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function createTranslator(locale: Locale) {
  const dict = messages[locale];

  return function t(key: MessageKey | string): string {
    return resolveMessage(dict, key) ?? key;
  };
}

export { nlMessages, enMessages };
export type { Messages };
