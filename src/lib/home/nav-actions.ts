import { BarChart3, FileText, Ticket } from "lucide-react";

import { messages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

export function getHomeNavActions(locale: Locale) {
  const home = messages[locale].home;

  return [
    {
      href: "/dashboard",
      label: home.navDashboard,
      description: home.navDashboardDesc,
      icon: BarChart3,
    },
    {
      href: "/dashboard/tickets",
      label: home.navTickets,
      description: home.navTicketsDesc,
      icon: Ticket,
    },
    {
      href: "/dashboard/suggestions",
      label: home.navSuggestions,
      description: home.navSuggestionsDesc,
      icon: FileText,
    },
  ] as const;
}
