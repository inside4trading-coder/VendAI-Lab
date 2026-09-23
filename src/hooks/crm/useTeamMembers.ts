import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TeamMember } from "@/lib/crm";

/** Directorio de cuentas del equipo, para asignar leads a una persona real. */
export function useTeamMembers() {
  return useQuery({
    queryKey: ["team_members"],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase.rpc("list_team_members");
      if (error) throw error;
      return data as TeamMember[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
