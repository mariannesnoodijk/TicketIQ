import { Suspense } from "react";

import { SuggestionsPageContent } from "@/components/features/suggestions/suggestions-page-content";
import { PageLoading } from "@/components/ui/page-loading";

export default function SuggestionsPage() {
  return (
    <Suspense fallback={<PageLoading messageKey="suggestions.loading" />}>
      <SuggestionsPageContent />
    </Suspense>
  );
}
