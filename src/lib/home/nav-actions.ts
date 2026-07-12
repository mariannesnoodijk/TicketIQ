import { BarChart3, FileText, Ticket } from "lucide-react";

export const HOME_NAV_ACTIONS = [
  {
    href: "/dashboard",
    label: "Dashboard bekijken",
    description: "Statistieken en trends",
    icon: BarChart3,
  },
  {
    href: "/dashboard/tickets",
    label: "Tickets bekijken",
    description: "Overzicht en filters",
    icon: Ticket,
  },
  {
    href: "/dashboard/suggestions",
    label: "Helpcenter-artikelen",
    description: "AI-voorstellen beheren",
    icon: FileText,
  },
] as const;
