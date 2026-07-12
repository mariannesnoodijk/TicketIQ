import { messages } from "@/lib/i18n";
import type { AnalyticsPeriod } from "@/lib/analytics/period";
import type { Locale } from "@/lib/i18n/types";

export function getIntlLocale(locale: Locale): string {
  return locale === "en" ? "en-GB" : "nl-NL";
}

/** Formatteert een datum veilig; ongeldige waarden tonen een streepje i.p.v. een crash. */
export function formatDisplayDate(
  value: string | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "full", timeStyle: "short" }
): string {
  if (!value) return messages[locale].common.dash;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return messages[locale].common.dash;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(date);
}

export function getAnalyticsPeriodLabel(period: AnalyticsPeriod, locale: Locale): string {
  return messages[locale].analytics.periods[period];
}

export function getAnalyticsPeriodOptions(locale: Locale) {
  const periods = messages[locale].analytics.periods;
  return (
    Object.entries(periods) as [AnalyticsPeriod, string][]
  ).map(([value, label]) => ({ value, label }));
}

export function getWeekdayFullLabels(locale: Locale): readonly string[] {
  return messages[locale].analytics.weekdaysFull;
}

export function getWeekdayFullLabel(weekday: number, locale: Locale): string {
  return getWeekdayFullLabels(locale)[weekday] ?? messages[locale].common.unknown;
}

export function getWeekdayShortLabels(locale: Locale): readonly string[] {
  return messages[locale].analytics.weekdaysShort;
}

export function ticketStatusLabel(status: string, locale: Locale): string {
  const labels = messages[locale].tickets.statusLabels;
  return status in labels ? labels[status as keyof typeof labels] : status;
}

export function ticketPriorityLabel(priority: string, locale: Locale): string {
  const labels = messages[locale].tickets.priorityLabels;
  return priority in labels ? labels[priority as keyof typeof labels] : priority;
}

export function suggestionStatusLabel(status: string, locale: Locale): string {
  const labels = messages[locale].suggestions.statusLabels;
  return status in labels ? labels[status as keyof typeof labels] : status;
}

export function agentToolLabel(toolName: string, locale: Locale): string {
  const labels = messages[locale].agentChat.tools;
  return toolName in labels ? labels[toolName as keyof typeof labels] : toolName;
}

export function agentToolStateLabel(state: string, locale: Locale): string {
  const labels = messages[locale].agentChat.toolStates;
  return state in labels ? labels[state as keyof typeof labels] : state;
}
