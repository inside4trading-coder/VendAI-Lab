import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole, Action } from "@/lib/permissions";
import { can, highestRole } from "@/lib/permissions";

// ---------- Profile ----------
export interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, avatar_url")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Profile, "user_id">>) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, ...patch });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });
}

// ---------- Company ----------
export interface CompanySettings {
  user_id: string;
  name: string | null;
  tax_id: string | null;
  address: string | null;
  logo_url: string | null;
  currency: string;
  timezone: string;
}
export function useCompanySettings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["company", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CompanySettings | null> => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as CompanySettings | null;
    },
  });
}
export function useUpdateCompany() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<CompanySettings, "user_id">>) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("company_settings")
        .upsert({ user_id: user.id, ...patch });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company", user?.id] }),
  });
}

// ---------- Preferences ----------
export interface Preferences {
  user_id: string;
  theme: "light" | "dark" | "system";
  language: "es" | "en";
  table_density: "comfortable" | "compact";
  notify_email: boolean;
  notify_in_app: boolean;
}
export function usePreferences() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["prefs", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Preferences | null> => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Preferences | null;
    },
  });
}
export function useUpdatePreferences() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Preferences, "user_id">>) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("user_preferences")
        .upsert({ user_id: user.id, ...patch });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prefs", user?.id] }),
  });
}

// ---------- Roles ----------
export function useUserRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AppRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
}
export function useRole(): AppRole {
  const { data: roles = [] } = useUserRoles();
  return highestRole(roles);
}
export function useCan(action: Action): boolean {
  const { data: roles = [] } = useUserRoles();
  return can(roles, action);
}
export function useAddRole() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (role: AppRole) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles", user?.id] }),
  });
}
export function useRemoveRole() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (role: AppRole) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles", user?.id] }),
  });
}

// ---------- Role invitations ----------
export interface RoleInvitation {
  id: string;
  email: string;
  role: AppRole;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  token: string;
}

export function useRoleInvitations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["role_invitations", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<RoleInvitation[]> => {
      const { data, error } = await supabase
        .from("role_invitations")
        .select("id, email, role, status, expires_at, accepted_at, created_at, token")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RoleInvitation[];
    },
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase
        .from("role_invitations")
        .insert({ email: email.trim().toLowerCase(), role, invited_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["role_invitations", user?.id] }),
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("role_invitations")
        .update({ status: "revoked" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["role_invitations", user?.id] }),
  });
}

export function useDeleteInvitation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("role_invitations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["role_invitations", user?.id] }),
  });
}

// ---------- Catalogs ----------
export interface LeadCategory { id: string; name: string; sort_order: number }
export interface ActivityType { id: string; code: string; label: string; sort_order: number }
export interface CatalogProduct {
  id: string;
  name: string;
  default_price: number;
  sku: string | null;
  notes: string | null;
}

function catalogHook<T extends { id: string }>(
  table: "lead_categories" | "activity_types" | "product_catalog",
  select: string,
  orderCol: string,
) {
  return function useCatalog() {
    const { user } = useAuth();
    return useQuery({
      queryKey: [table, user?.id],
      enabled: !!user,
      queryFn: async (): Promise<T[]> => {
        const { data, error } = await supabase
          .from(table)
          .select(select)
          .order(orderCol, { ascending: true });
        if (error) throw error;
        return (data ?? []) as unknown as T[];
      },
    });
  };
}

export const useLeadCategories = catalogHook<LeadCategory>(
  "lead_categories",
  "id, name, sort_order",
  "sort_order",
);
export const useActivityTypes = catalogHook<ActivityType>(
  "activity_types",
  "id, code, label, sort_order",
  "sort_order",
);
export const useProductCatalog = catalogHook<CatalogProduct>(
  "product_catalog",
  "id, name, default_price, sku, notes",
  "name",
);

export function useCatalogMutations(table: "lead_categories" | "activity_types" | "product_catalog") {
  const qc = useQueryClient();
  const { user } = useAuth();
  const invalidate = () => qc.invalidateQueries({ queryKey: [table, user?.id] });

  const create = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase.from(table).insert({ ...row, user_id: user.id } as never);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from(table).update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
