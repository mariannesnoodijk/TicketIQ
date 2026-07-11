import { Suspense } from "react";

import { TicketsPageContent } from "@/components/features/tickets/tickets-page-content";

export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-10 text-sm text-muted-foreground">Tickets laden…</p>
      }
    >
      <TicketsPageContent />
    </Suspense>
  );
}
