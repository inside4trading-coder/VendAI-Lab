import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Machine } from "@/lib/machines";

export type NewMachine = Omit<Machine, "id" | "user_id" | "created_at" | "updated_at">;

const KEY = ["machines"] as const;

export function useMachines() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEY,
    enabled: !!user,
    queryFn: async (): Promise<Machine[]> => {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("code", { ascending: true });
      if (error) throw error;
      return data as Machine[];
    },
  });
}

export function useCreateMachine() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewMachine) => {
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase
        .from("machines")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Machine;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<NewMachine> }) => {
      const { data, error } = await supabase
        .from("machines")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Machine;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
