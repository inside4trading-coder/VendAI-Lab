import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ActivityKind = "lead" | "service" | "sale";

export interface RecentActivityItem {
  id: string;
  text: string;
  occurredAt: string;
  kind: ActivityKind;
}

export interface NextActionItem {
  id: string;
  name: string;
  when: string;
  note: string | null;
}

export interface DashboardData {
  salesThisMonth: number;
  recentActivity: RecentActivityItem[];
  nextAction: NextActionItem | null;
}

export function formatRelative(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Hace ${weeks} sem`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} meses`;
  return new Date(iso).toLocaleDateString("es-ES");
}

export function formatNextWhen(iso: string): string {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return f.charAt(0).toUpperCase() + f.slice(1);
}

function prettifyType(t: string): string {
  const map: Record<string, string> = {
    nota: "Nueva nota",
    llamada: "Llamada",
    email: "Email",
    reunion: "Reunión",
    visita: "Visita",
    reposicion: "Reposición",
    mantenimiento: "Mantenimiento",
    reparacion: "Reparación",
    limpieza: "Limpieza",
    otro: "Actividad",
  };
  return map[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
}

export function useDashboardData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async (): Promise<DashboardData> => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const nowIso = new Date().toISOString();

      const [salesAgg, leadActs, services, sales, nextLeads, leads, machines] =
        await Promise.all([
          supabase
            .from("machine_sales")
            .select("total")
            .gte("sold_at", startOfMonth.toISOString()),
          supabase
            .from("lead_activities")
            .select("id, type, title, occurred_at, lead_id")
            .order("occurred_at", { ascending: false })
            .limit(6),
          supabase
            .from("machine_services")
            .select("id, type, title, occurred_at, machine_id")
            .order("occurred_at", { ascending: false })
            .limit(6),
          supabase
            .from("machine_sales")
            .select("id, product_name, quantity, sold_at, machine_id")
            .order("sold_at", { ascending: false })
            .limit(6),
          supabase
            .from("leads")
            .select("id, name, next_action_at, next_action_note")
            .gte("next_action_at", nowIso)
            .order("next_action_at", { ascending: true })
            .limit(1),
          supabase.from("leads").select("id, name"),
          supabase.from("machines").select("id, name, code"),
        ]);

      if (salesAgg.error) throw salesAgg.error;
      if (leadActs.error) throw leadActs.error;
      if (services.error) throw services.error;
      if (sales.error) throw sales.error;
      if (nextLeads.error) throw nextLeads.error;
      if (leads.error) throw leads.error;
      if (machines.error) throw machines.error;

      const leadMap = new Map((leads.data ?? []).map((l) => [l.id, l.name]));
      const machineMap = new Map(
        (machines.data ?? []).map((m) => [m.id, { name: m.name, code: m.code }]),
      );

      const salesThisMonth = (salesAgg.data ?? []).reduce(
        (acc, row) => acc + Number(row.total ?? 0),
        0,
      );

      const activityItems: RecentActivityItem[] = [];

      for (const row of leadActs.data ?? []) {
        const leadName = leadMap.get(row.lead_id) ?? "lead";
        const label = row.title ?? prettifyType(row.type);
        activityItems.push({
          id: `la-${row.id}`,
          text: `${label} · ${leadName}`,
          occurredAt: row.occurred_at,
          kind: "lead",
        });
      }

      for (const row of services.data ?? []) {
        const m = machineMap.get(row.machine_id);
        const machine = m ? `${m.code} · ${m.name}` : "máquina";
        const label = row.title ?? prettifyType(row.type);
        activityItems.push({
          id: `ms-${row.id}`,
          text: `${label} · ${machine}`,
          occurredAt: row.occurred_at,
          kind: "service",
        });
      }

      for (const row of sales.data ?? []) {
        const m = machineMap.get(row.machine_id);
        const machine = m ? m.code : "máquina";
        activityItems.push({
          id: `sa-${row.id}`,
          text: `Venta: ${row.product_name} ×${row.quantity} · ${machine}`,
          occurredAt: row.sold_at,
          kind: "sale",
        });
      }

      const recentActivity = activityItems
        .sort(
          (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        )
        .slice(0, 6);

      const nextRow = (nextLeads.data ?? [])[0];
      const nextAction: NextActionItem | null = nextRow
        ? {
            id: nextRow.id,
            name: nextRow.name,
            when: nextRow.next_action_at as string,
            note: nextRow.next_action_note,
          }
        : null;

      return { salesThisMonth, recentActivity, nextAction };
    },
  });
}
