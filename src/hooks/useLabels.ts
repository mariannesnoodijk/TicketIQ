"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";
import type { LabelInsert, LabelUpdate } from "@/types";

export function useLabels() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.labels.all,
    queryFn: async () => {
      const { data, error } = await supabase.from("labels").select("*").order("name");

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: Omit<LabelInsert, "user_id">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const { data, error } = await supabase
        .from("labels")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: LabelUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("labels")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.detail(data.id) });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("labels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.labels.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}
