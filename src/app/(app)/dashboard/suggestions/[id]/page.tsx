import { SuggestionDetailPage } from "@/components/features/suggestions/suggestion-detail-content";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <SuggestionDetailPage params={params} />;
}
