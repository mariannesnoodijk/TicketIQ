"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";
import type { AiSuggestionInsert, AiSuggestionUpdate } from "@/types";

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

export function useAiSuggestions() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.aiSuggestions.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*, categories ( id, name, color )")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAiSuggestion() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: Omit<AiSuggestionInsert, "user_id">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const { data, error } = await supabase
        .from("ai_suggestions")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.aiSuggestions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useUpdateAiSuggestion() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: AiSuggestionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("ai_suggestions")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.aiSuggestions.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aiSuggestions.detail(data.id),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useDeleteAiSuggestion() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_suggestions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.aiSuggestions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}
