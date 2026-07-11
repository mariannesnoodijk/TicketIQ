"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";

export function useTicketLabels(ticketId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...queryKeys.tickets.detail(ticketId), "labels"] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_labels")
        .select("label_id, labels ( id, name )")
        .eq("ticket_id", ticketId);

      if (error) throw error;
      return data;
    },
    enabled: Boolean(ticketId),
  });
}

export function useAddTicketLabel() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ ticketId, labelId }: { ticketId: string; labelId: string }) => {
      const { error } = await supabase
        .from("ticket_labels")
        .insert({ ticket_id: ticketId, label_id: labelId });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(variables.ticketId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
}

export function useRemoveTicketLabel() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ ticketId, labelId }: { ticketId: string; labelId: string }) => {
      const { error } = await supabase
        .from("ticket_labels")
        .delete()
        .eq("ticket_id", ticketId)
        .eq("label_id", labelId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(variables.ticketId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
}
