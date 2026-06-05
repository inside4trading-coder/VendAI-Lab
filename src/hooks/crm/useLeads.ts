import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lead } from "@/lib/crm";
import { SEED_LEADS } from "@/lib/crm";
import type { ImportedLead } from "@/lib/crm-import";


export type NewLead = Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">;

const KEY = ["leads"] as const;

export function useLeads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: KEY,
    enabled: !!user,
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewLead) => {
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase
        .from("leads")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<NewLead> }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Lead;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<Lead[]>(KEY);
      qc.setQueryData<Lead[]>(KEY, (old) =>
        (old ?? []).map((l) => (l.id === id ? { ...l, ...patch } : l)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkSeedLeads() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No autenticado");
      const payload = SEED_LEADS.map((l) => ({ ...l, user_id: user.id }));
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useImportLeads() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      leads,
      onProgress,
    }: {
      leads: ImportedLead[];
      onProgress?: (done: number, total: number) => void;
    }) => {
      if (!user) throw new Error("No autenticado");
      const CHUNK = 100;
      let done = 0;
      for (let i = 0; i < leads.length; i += CHUNK) {
        const chunk = leads.slice(i, i + CHUNK).map((l) => ({ ...l, user_id: user.id }));
        const { error } = await supabase.from("leads").insert(chunk);
        if (error) throw error;
        done += chunk.length;
        onProgress?.(done, leads.length);
      }
      return done;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
