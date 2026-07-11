import { TicketDetailPage } from "@/components/features/tickets/ticket-detail-content";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <TicketDetailPage params={params} />;
}
