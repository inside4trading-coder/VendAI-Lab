import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { MachineSale } from "@/lib/machines";

export interface NewMachineSale {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  sold_at?: string;
}

const key = (machineId: string | null) => ["machine_sales", machineId] as const;

export function useMachineSales(machineId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: key(machineId),
    enabled: !!user && !!machineId,
    queryFn: async (): Promise<MachineSale[]> => {
      const { data, error } = await supabase
        .from("machine_sales")
        .select("*")
        .eq("machine_id", machineId!)
        .order("sold_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as MachineSale[];
    },
  });
}

export function useAllMachineSales() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["machine_sales", "all"] as const,
    enabled: !!user,
    queryFn: async (): Promise<MachineSale[]> => {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const { data, error } = await supabase
        .from("machine_sales")
        .select("*")
        .gte("sold_at", since.toISOString())
        .order("sold_at", { ascending: false });
      if (error) throw error;
      return data as MachineSale[];
    },
  });
}

export function useCreateMachineSale(machineId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewMachineSale) => {
      if (!user) throw new Error("No autenticado");
      const total = Number((input.quantity * input.unit_price).toFixed(2));
      const { data, error } = await supabase
        .from("machine_sales")
        .insert({
          machine_id: machineId,
          user_id: user.id,
          product_id: input.product_id,
          product_name: input.product_name,
          quantity: input.quantity,
          unit_price: input.unit_price,
          total,
          sold_at: input.sold_at ?? new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      // Si hay producto vinculado, descontar stock
      if (input.product_id) {
        const { data: prod } = await supabase
          .from("machine_products")
          .select("stock")
          .eq("id", input.product_id)
          .single();
        if (prod) {
          const nextStock = Math.max(0, (prod.stock ?? 0) - input.quantity);
          await supabase
            .from("machine_products")
            .update({ stock: nextStock })
            .eq("id", input.product_id);
        }
      }

      return data as MachineSale;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(machineId) });
      qc.invalidateQueries({ queryKey: ["machine_sales", "all"] });
      qc.invalidateQueries({ queryKey: ["machine_products", machineId] });
      qc.invalidateQueries({ queryKey: ["machine_products", "all"] });
    },
  });
}

export function useDeleteMachineSale(machineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("machine_sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(machineId) });
      qc.invalidateQueries({ queryKey: ["machine_sales", "all"] });
    },
  });
}
