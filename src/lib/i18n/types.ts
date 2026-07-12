export type Locale = "nl" | "en";

export const DEFAULT_LOCALE: Locale = "nl";
export const LOCALE_STORAGE_KEY = "ticketiq-locale";

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "nl", label: "NL" },
  { value: "en", label: "ENG" },
];

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "nl" || value === "en";
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
