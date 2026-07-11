import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type SourceTicketContext = {
  externalId: string;
  subject: string;
  body: string | null;
  channel: string | null;
};

/** Haalt bron-tickets op met volledige body (niet afgekapt) voor AI-revisie. */
export async function fetchSourceTicketsForSuggestion(
  supabase: SupabaseServerClient,
  userId: string,
  externalIds: string[] | undefined
): Promise<SourceTicketContext[]> {
  if (!externalIds?.length) return [];

  const { data, error } = await supabase
    .from("tickets")
    .select("external_id, subject, body, channel")
    .eq("user_id", userId)
    .in("external_id", externalIds);

  if (error) throw error;

  const byExternalId = new Map(
    (data ?? []).map((ticket) => [
      ticket.external_id,
      {
        externalId: ticket.external_id,
        subject: ticket.subject,
        body: ticket.body,
        channel: ticket.channel,
      },
    ])
  );

  return externalIds
    .map((id) => byExternalId.get(id))
    .filter((ticket): ticket is SourceTicketContext => ticket != null);
}
