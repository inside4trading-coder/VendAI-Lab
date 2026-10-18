import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDateRange, type CallPeriod, type DateRange } from "@/lib/calls";

/** Llamada vinculada a un lead por teléfono (vista lead_calls). */
export interface LeadCall {
  id: string;
  lead_id: string;
  lead_name: string;
  call_start: string | null;
  direction: string | null;
  status: string | null;
  duration: number;
  talk_duration: number;
  agent_name: string | null;
  caller: string | null;
  destination: string | null;
  cost: number;
  cost_currency: string | null;
  is_recorded: boolean;
  recording_url: string | null;
}

export interface CallLeadLink {
  leadId: string;
  leadName: string;
}

/** Todas las llamadas de un lead, de más reciente a más antigua. */
export function useLeadCalls(leadId: string | null) {
  return useQuery({
    queryKey: ["lead_calls", leadId],
    enabled: Boolean(leadId),
    queryFn: async (): Promise<LeadCall[]> => {
      const { data, error } = await supabase
        .from("lead_calls")
        .select(
          "id, lead_id, lead_name, call_start, direction, status, duration, talk_duration, agent_name, caller, destination, cost, cost_currency, is_recorded, recording_url",
        )
        .eq("lead_id", leadId as string)
        .order("call_start", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((c) => ({
        ...c,
        duration: Number(c.duration) || 0,
        talk_duration: Number(c.talk_duration) || 0,
        cost: Number(c.cost) || 0,
        is_recorded: Boolean(c.is_recorded),
      })) as LeadCall[];
    },
  });
}

/** Lead de cada llamada del periodo, por id de llamada (para la página Llamadas). */
export function useCallLeadLinks(period: CallPeriod, customRange?: DateRange) {
  return useQuery({
    queryKey: ["lead_calls", "links", period, customRange?.start.toISOString(), customRange?.end.toISOString()],
    queryFn: async (): Promise<Map<string, CallLeadLink>> => {
      const { start, end } = getDateRange(period, customRange);
      const { data, error } = await supabase
        .from("lead_calls")
        .select("id, lead_id, lead_name")
        .gte("call_start", start.toISOString())
        .lte("call_start", end.toISOString());
      if (error) throw error;
      return new Map(
        (data ?? [])
          .filter((r) => r.id && r.lead_id)
          .map((r) => [r.id as string, { leadId: r.lead_id as string, leadName: r.lead_name ?? "" }]),
      );
    },
  });
}
