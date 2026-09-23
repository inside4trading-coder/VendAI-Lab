import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { LeadActivity } from "@/lib/crm";

export function useLeadActivities(leadId: string | null) {
  return useQuery({
    queryKey: ["lead_activities", leadId],
    enabled: !!leadId,
    queryFn: async (): Promise<LeadActivity[]> => {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId!)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data as LeadActivity[];
    },
  });
}

export interface NewActivity {
  lead_id: string;
  type: string;
  title?: string | null;
  body?: string | null;
}

export function useCreateActivity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewActivity) => {
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase
        .from("lead_activities")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as LeadActivity;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["lead_activities", vars.lead_id] });
      qc.invalidateQueries({ queryKey: ["lead_activity_counts"] });
    },
  });
}

/** Nº de actividades registradas por lead, para el badge del Kanban y el filtro "sin actividad". */
export function useLeadActivityCounts() {
  return useQuery({
    queryKey: ["lead_activity_counts"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase.from("lead_activities").select("lead_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data as { lead_id: string }[]) {
        counts[row.lead_id] = (counts[row.lead_id] ?? 0) + 1;
      }
      return counts;
    },
  });
}
