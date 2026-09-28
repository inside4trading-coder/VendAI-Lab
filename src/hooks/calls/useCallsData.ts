import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildCallsData,
  getDateRange,
  type CallPeriod,
  type CallRecord,
  type DateRange,
} from "@/lib/calls";

const CALLS_KEY = "calls";

/** Llamadas cacheadas de Zadarma en el periodo, agregadas para el panel. */
export function useCallsData(period: CallPeriod, customRange?: DateRange) {
  return useQuery({
    queryKey: [CALLS_KEY, period, customRange?.start.toISOString(), customRange?.end.toISOString()],
    queryFn: async () => {
      const { start, end } = getDateRange(period, customRange);
      const { data, error } = await supabase
        .from("calls_cache")
        .select(
          "id, call_id, pbx_call_id, call_start, call_end, caller, destination, direction, status, duration, talk_duration, sip, agent_name, cost, cost_currency, is_recorded, recording_url",
        )
        .gte("call_start", start.toISOString())
        .lte("call_start", end.toISOString())
        .order("call_start", { ascending: false });
      if (error) throw error;
      return buildCallsData((data ?? []) as CallRecord[]);
    },
  });
}

/** Formato que espera la edge function: "YYYY-MM-DD HH:MM:SS" en UTC. */
const toZadarmaUtc = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

/** Trae llamadas de Zadarma al caché para el periodo y refresca el panel. */
export function useSyncCalls() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ period, customRange }: { period: CallPeriod; customRange?: DateRange }) => {
      const { start, end } = getDateRange(period, customRange);
      const { data, error } = await supabase.functions.invoke<{ synced: number; error?: string }>(
        "zadarma-sync",
        { body: { start: toZadarmaUtc(start), end: toZadarmaUtc(end) } },
      );
      if (error) {
        const detail = await error.context?.json?.().catch(() => null);
        throw new Error(detail?.error ?? error.message);
      }
      return data?.synced ?? 0;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CALLS_KEY] }),
  });
}
