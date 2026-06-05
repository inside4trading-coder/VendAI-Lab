import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { MachineProduct } from "@/lib/machines";

export type NewMachineProduct = Omit<
  MachineProduct,
  "id" | "user_id" | "created_at" | "updated_at" | "machine_id"
>;

const key = (machineId: string | null) => ["machine_products", machineId] as const;

export function useMachineProducts(machineId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: key(machineId),
    enabled: !!user && !!machineId,
    queryFn: async (): Promise<MachineProduct[]> => {
      const { data, error } = await supabase
        .from("machine_products")
        .select("*")
        .eq("machine_id", machineId!)
        .order("slot_code", { ascending: true });
      if (error) throw error;
      return data as MachineProduct[];
    },
  });
}

export function useAllMachineProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["machine_products", "all"] as const,
    enabled: !!user,
    queryFn: async (): Promise<MachineProduct[]> => {
      const { data, error } = await supabase.from("machine_products").select("*");
      if (error) throw error;
      return data as MachineProduct[];
    },
  });
}

export function useUpsertMachineProduct(machineId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewMachineProduct & { id?: string }) => {
      if (!user) throw new Error("No autenticado");
      if (input.id) {
        const { id, ...patch } = input;
        const { data, error } = await supabase
          .from("machine_products")
          .update(patch)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as MachineProduct;
      }
      const { data, error } = await supabase
        .from("machine_products")
        .insert({ ...input, machine_id: machineId, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as MachineProduct;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(machineId) });
      qc.invalidateQueries({ queryKey: ["machine_products", "all"] });
    },
  });
}

export function useDeleteMachineProduct(machineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("machine_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(machineId) });
      qc.invalidateQueries({ queryKey: ["machine_products", "all"] });
    },
  });
}
