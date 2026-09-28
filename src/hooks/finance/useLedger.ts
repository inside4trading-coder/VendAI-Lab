import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_EUR_USD_RATE, type LedgerMovement } from "@/lib/ledger";

const MOVEMENTS_KEY = ["finance_movements"];
const SETTINGS_KEY = ["finance_settings"];

export type NewMovement = Pick<
  LedgerMovement,
  "occurred_on" | "member_id" | "kind" | "description" | "currency" | "amount"
>;

export function useFinanceMovements() {
  return useQuery({
    queryKey: MOVEMENTS_KEY,
    queryFn: async (): Promise<LedgerMovement[]> => {
      const { data, error } = await supabase
        .from("finance_movements")
        .select("id, occurred_on, member_id, kind, description, currency, amount, created_at")
        .order("occurred_on", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((m) => ({ ...m, amount: Number(m.amount) })) as LedgerMovement[];
    },
  });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewMovement) => {
      const { error } = await supabase.from("finance_movements").insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MOVEMENTS_KEY }),
  });
}

export function useUpdateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: NewMovement }) => {
      const { error } = await supabase
        .from("finance_movements")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MOVEMENTS_KEY }),
  });
}

export function useDeleteMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("finance_movements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MOVEMENTS_KEY }),
  });
}

/** Tipo de cambio EUR→USD compartido por el equipo (hoja "Config"). */
export function useEurUsdRate() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from("finance_settings")
        .select("eur_usd_rate")
        .maybeSingle();
      if (error) throw error;
      return Number(data?.eur_usd_rate) || DEFAULT_EUR_USD_RATE;
    },
  });
}

export function useUpdateEurUsdRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rate: number) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("finance_settings")
        .update({ eur_usd_rate: rate, updated_at: new Date().toISOString(), updated_by: auth.user?.id ?? null })
        .eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
}
