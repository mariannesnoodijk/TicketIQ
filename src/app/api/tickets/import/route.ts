import { NextResponse } from "next/server";

import { ensureDefaultCategories } from "@/lib/categories/ensureDefaultCategories";
import { categorizeUncategorizedTickets } from "@/lib/categories/categorizeTickets";
import { inferCategoryName } from "@/lib/categories/inferCategory";
import { fetchDummyJsonTickets } from "@/lib/dummyjson";
import { createClient } from "@/lib/supabase/server";
import { mapDummyJsonTickets } from "@/lib/tickets/mapDummyJsonTicket";

const BATCH_SIZE = 50;

function resolveCategoryId(categoryName: string, categoryByName: Map<string, string>) {
  return (
    categoryByName.get(categoryName) ??
    categoryByName.get("Overig / Onboarding nieuwe klant") ??
    null
  );
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const categoryByName = await ensureDefaultCategories(supabase, user.id);

    const rawTickets = await fetchDummyJsonTickets();
    const mapped = mapDummyJsonTickets(rawTickets);

    const { data: existingTickets, error: existingError } = await supabase
      .from("tickets")
      .select("external_id")
      .eq("user_id", user.id);

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const existingIds = new Set((existingTickets ?? []).map((t) => t.external_id));
    const newTickets = mapped.filter((m) => !existingIds.has(m.ticket.external_id));

    let imported = 0;

    if (newTickets.length > 0) {
      for (let i = 0; i < newTickets.length; i += BATCH_SIZE) {
        const batch = newTickets.slice(i, i + BATCH_SIZE);
        const inserts = batch.map((m) => {
          const categoryName = inferCategoryName(
            m.ticket.subject,
            m.ticket.body,
            m.sourceLabel
          );

          return {
            ...m.ticket,
            user_id: user.id,
            category_id: resolveCategoryId(categoryName, categoryByName),
          };
        });

        const { data: inserted, error: insertError } = await supabase
          .from("tickets")
          .insert(inserts)
          .select("id, external_id");

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        imported += inserted?.length ?? 0;

        await linkSourceLabels(supabase, user.id, batch, inserted ?? []);
      }
    }

    const backfilled = await categorizeUncategorizedTickets(
      supabase,
      user.id,
      categoryByName
    );

    return NextResponse.json({
      imported,
      skipped: mapped.length - newTickets.length,
      backfilled,
      total: mapped.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import mislukt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function linkSourceLabels(
  supabase: SupabaseServerClient,
  userId: string,
  batch: ReturnType<typeof mapDummyJsonTickets>,
  inserted: { id: string; external_id: string }[]
) {
  const externalToId = new Map(inserted.map((t) => [t.external_id, t.id]));
  const labelNames = new Set<string>();

  for (const item of batch) {
    if (item.sourceLabel) {
      labelNames.add(item.sourceLabel);
    }
  }

  if (labelNames.size === 0) return;

  const { data: existingLabels } = await supabase
    .from("labels")
    .select("id, name")
    .eq("user_id", userId)
    .in("name", [...labelNames]);

  const labelByName = new Map((existingLabels ?? []).map((l) => [l.name, l.id]));
  const missingNames = [...labelNames].filter((name) => !labelByName.has(name));

  if (missingNames.length > 0) {
    const { data: newLabels } = await supabase
      .from("labels")
      .insert(missingNames.map((name) => ({ user_id: userId, name })))
      .select("id, name");

    for (const label of newLabels ?? []) {
      labelByName.set(label.name, label.id);
    }
  }

  const links: { ticket_id: string; label_id: string }[] = [];

  for (const item of batch) {
    if (!item.sourceLabel) continue;

    const ticketId = externalToId.get(item.ticket.external_id);
    const labelId = labelByName.get(item.sourceLabel);

    if (ticketId && labelId) {
      links.push({ ticket_id: ticketId, label_id: labelId });
    }
  }

  if (links.length > 0) {
    await supabase.from("ticket_labels").upsert(links, {
      onConflict: "ticket_id,label_id",
      ignoreDuplicates: true,
    });
  }
}
