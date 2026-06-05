export const MACHINE_STATUSES = ["Activa", "Mantenimiento", "Inactiva"] as const;
export type MachineStatus = (typeof MACHINE_STATUSES)[number];

export const SERVICE_TYPES = [
  "reposicion",
  "mantenimiento",
  "reparacion",
  "limpieza",
  "otro",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  reposicion: "Reposición",
  mantenimiento: "Mantenimiento",
  reparacion: "Reparación",
  limpieza: "Limpieza",
  otro: "Otro",
};

export interface Machine {
  id: string;
  user_id: string;
  code: string;
  name: string;
  model: string | null;
  status: string;
  lead_id: string | null;
  location_label: string | null;
  slots_total: number;
  installed_at: string | null;
  last_service_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MachineProduct {
  id: string;
  user_id: string;
  machine_id: string;
  slot_code: string;
  product_name: string;
  price: number;
  stock: number;
  stock_capacity: number;
  created_at: string;
  updated_at: string;
}

export interface MachineSale {
  id: string;
  user_id: string;
  machine_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  sold_at: string;
  created_at: string;
}

export interface MachineService {
  id: string;
  user_id: string;
  machine_id: string;
  type: string;
  title: string | null;
  body: string | null;
  occurred_at: string;
  created_at: string;
}

export const machineStatusStyles: Record<string, { dot: string; badge: string }> = {
  Activa: { dot: "bg-crypto-green", badge: "bg-crypto-green/12 text-crypto-green" },
  Mantenimiento: { dot: "bg-amber-400", badge: "bg-amber-400/15 text-amber-600" },
  Inactiva: { dot: "bg-muted-ink", badge: "bg-muted-ink/15 text-ink-2" },
};

export function computeStockPercent(products: MachineProduct[]): number {
  if (!products.length) return 0;
  const cap = products.reduce((s, p) => s + (p.stock_capacity || 0), 0);
  if (cap === 0) return 0;
  const stock = products.reduce((s, p) => s + (p.stock || 0), 0);
  return Math.round((stock / cap) * 100);
}

export function computeSalesToday(sales: MachineSale[]): number {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  return sales.filter((s) => {
    const dt = new Date(s.sold_at);
    return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
  }).length;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}
