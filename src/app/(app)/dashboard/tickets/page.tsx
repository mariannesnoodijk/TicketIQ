import { Suspense } from "react";

import { TicketsPageContent } from "@/components/features/tickets/tickets-page-content";
import { PageLoading } from "@/components/ui/page-loading";

export default function TicketsPage() {
  return (
    <Suspense fallback={<PageLoading messageKey="tickets.loading" />}>
      <TicketsPageContent />
    </Suspense>
  );
}
