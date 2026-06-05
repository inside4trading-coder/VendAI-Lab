import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { MachineService } from "@/lib/machines";

export interface NewMachineService {
  type: string;
  title?: string | null;
  body?: string | null;
  occurred_at?: string;
}

const key = (machineId: string | null) => ["machine_services", machineId] as const;

export function useMachineServices(machineId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: key(machineId),
    enabled: !!user && !!machineId,
    queryFn: async (): Promise<MachineService[]> => {
      const { data, error } = await supabase
        .from("machine_services")
        .select("*")
        .eq("machine_id", machineId!)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data as MachineService[];
    },
  });
}

export function useCreateMachineService(machineId: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewMachineService) => {
      if (!user) throw new Error("No autenticado");
      const occurred = input.occurred_at ?? new Date().toISOString();
      const { data, error } = await supabase
        .from("machine_services")
        .insert({
          machine_id: machineId,
          user_id: user.id,
          type: input.type,
          title: input.title ?? null,
          body: input.body ?? null,
          occurred_at: occurred,
        })
        .select()
        .single();
      if (error) throw error;

      if (["mantenimiento", "reparacion", "limpieza"].includes(input.type)) {
        await supabase
          .from("machines")
          .update({ last_service_at: occurred.slice(0, 10) })
          .eq("id", machineId);
      }
      return data as MachineService;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(machineId) });
      qc.invalidateQueries({ queryKey: ["machines"] });
    },
  });
}

export function useDeleteMachineService(machineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("machine_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(machineId) }),
  });
}
