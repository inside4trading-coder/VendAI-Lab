/** Formato de llamadas compartido por la página Llamadas y la ficha del lead. */

export const DIRECTION_LABELS: Record<string, string> = {
  incoming: "↙ Entrante",
  outgoing: "↗ Saliente",
  internal: "↔ Interna",
};

/** Zadarma factura en la moneda de la cuenta; si aún no hay coste conocido se muestra en EUR. */
const DEFAULT_COST_CURRENCY = "EUR";
export const formatCost = (amount: number, currency: string | null) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: currency || DEFAULT_COST_CURRENCY }).format(
    Number(amount) || 0,
  );

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
