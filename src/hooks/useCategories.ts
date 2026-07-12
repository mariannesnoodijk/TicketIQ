"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_CATEGORIES } from "@/lib/categories/defaultCategories";
import { queryKeys } from "@/lib/queryKeys";
import { createClient } from "@/lib/supabase/client";
import type { CategoryInsert, CategoryUpdate } from "@/types";

export function useCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: Omit<CategoryInsert, "user_id">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const { data, error } = await supabase
        .from("categories")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: CategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(data.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}

export function useSeedDefaultCategories() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Niet ingelogd");

      const { data: existing, error: fetchError } = await supabase
        .from("categories")
        .select("name")
        .eq("user_id", user.id);

      if (fetchError) throw fetchError;

      const existingNames = new Set((existing ?? []).map((c) => c.name));
      const toInsert = DEFAULT_CATEGORIES.filter((c) => !existingNames.has(c.name)).map(
        (c) => ({
          user_id: user.id,
          name: c.name,
          color: c.color,
        })
      );

      if (toInsert.length === 0) {
        return { inserted: 0, skipped: DEFAULT_CATEGORIES.length };
      }

      const { error: insertError } = await supabase.from("categories").insert(toInsert);
      if (insertError) throw insertError;

      return {
        inserted: toInsert.length,
        skipped: DEFAULT_CATEGORIES.length - toInsert.length,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats.dashboard });
    },
  });
}
