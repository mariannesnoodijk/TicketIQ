"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type AiSuggestionListFilters, queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";
import type { AiSuggestionInsert, AiSuggestionUpdate } from "@/types";

const suggestionSelect = "*, categories ( id, name, color )";

function invalidateSuggestionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  suggestionId?: string
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.aiSuggestions.lists() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.stats.suggestionStatusDistribution,
  });

  if (suggestionId) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.aiSuggestions.detail(suggestionId),
    });
  }
}

export function useAiSuggestions(filters: AiSuggestionListFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.aiSuggestions.list(filters),
    queryFn: async () => {
      let query = supabase
        .from("ai_suggestions")
        .select(suggestionSelect)
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.search?.trim()) {
        query = query.ilike("title", `%${filters.search.trim()}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useAiSuggestion(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.aiSuggestions.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select(suggestionSelect)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
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
      invalidateSuggestionQueries(queryClient);
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
      invalidateSuggestionQueries(queryClient, data.id);
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
      invalidateSuggestionQueries(queryClient);
    },
  });
}
