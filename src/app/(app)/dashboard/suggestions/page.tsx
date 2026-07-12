import { Suspense } from "react";

import { SuggestionsPageContent } from "@/components/features/suggestions/suggestions-page-content";

export default function SuggestionsPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-10 text-sm text-muted-foreground">Helpcenter-artikelen laden…</p>
      }
    >
      <SuggestionsPageContent />
    </Suspense>
  );
}
