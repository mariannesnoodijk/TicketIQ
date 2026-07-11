"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, type TicketListFilters } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";
import type { TicketUpdate } from "@/types";

const TICKET_SELECT = `
  *,
  categories ( id, name, color ),
  ticket_labels (
    label_id,
    labels ( id, name )
  )
`;

export type TicketWithRelations = NonNullable<
  Awaited<ReturnType<typeof fetchTickets>>["data"]
>[number];

async function fetchTickets(filters: TicketListFilters) {
  const supabase = createClient();
  let query = supabase
    .from("tickets")
    .select(TICKET_SELECT)
    .order("ticket_created_at", { ascending: false, nullsFirst: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.search) {
    query = query.ilike("subject", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (!filters.labelId) {
    return { data: data ?? [] };
  }

  const filtered = (data ?? []).filter((ticket) =>
    ticket.ticket_labels?.some((tl) => tl.label_id === filters.labelId)
  );

  return { data: filtered };
}

export function useTickets(filters: TicketListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters),
    queryFn: async () => {
      const { data } = await fetchTickets(filters);
      return data;
    },
  });
}

export function useTicket(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(TICKET_SELECT)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: TicketUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("tickets")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(data.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tickets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useDashboardStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.stats.dashboard,
    queryFn: async () => {
      const [tickets, categories, labels, suggestions] = await Promise.all([
        supabase.from("tickets").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("labels").select("id", { count: "exact", head: true }),
        supabase.from("ai_suggestions").select("id", { count: "exact", head: true }),
      ]);

      if (tickets.error) throw tickets.error;
      if (categories.error) throw categories.error;
      if (labels.error) throw labels.error;
      if (suggestions.error) throw suggestions.error;

      return {
        tickets: tickets.count ?? 0,
        categories: categories.count ?? 0,
        labels: labels.count ?? 0,
        suggestions: suggestions.count ?? 0,
      };
    },
  });
}
