import { MapPin, Wrench, ShoppingCart } from "lucide-react";
import type { Machine, MachineProduct, MachineSale } from "@/lib/machines";
import { computeStockPercent, computeSalesToday, formatDate } from "@/lib/machines";
import type { Lead } from "@/lib/crm";
import { MachineStatusBadge } from "./MachineStatusBadge";

interface Props {
  machine: Machine;
  lead?: Lead;
  products: MachineProduct[];
  sales: MachineSale[];
  onOpen: () => void;
}

export function MachineCard({ machine, lead, products, sales, onOpen }: Props) {
  const stockPct = computeStockPercent(products);
  const salesToday = computeSalesToday(sales);
  const location = lead?.name ?? machine.location_label ?? "Sin asignar";

  const stockColor =
    stockPct < 30 ? "bg-destructive" : stockPct < 60 ? "bg-amber-400" : "bg-crypto-green";

  return (
    <article
      onClick={onOpen}
      className="bg-paper border border-line rounded-xl p-5 flex flex-col gap-4 hover:border-ink/30 hover:shadow-[0_8px_30px_-12px_rgba(14,17,22,0.12)] transition-all cursor-pointer"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-faint">
            {machine.code}
          </span>
          <h3 className="mt-1 text-[16px] font-mono font-semibold tracking-tight text-ink truncate">
            {machine.name}
          </h3>
          {machine.model && (
            <p className="text-[13px] text-muted-foreground truncate">{machine.model}</p>
          )}
        </div>
        <MachineStatusBadge status={machine.status} />
      </header>

      <div className="flex items-center gap-2 text-[13px] text-ink-2 border-t border-line pt-3">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-none" />
        <span className="truncate">{location}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            <ShoppingCart className="h-3 w-3" /> Ventas hoy
          </div>
          <p
            className="mt-1 text-[22px] font-bold tracking-tight text-ink"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            {salesToday}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            <Wrench className="h-3 w-3" /> Último servicio
          </div>
          <p className="mt-1 font-mono text-[13px] text-ink">{formatDate(machine.last_service_at)}</p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground">
            Stock
          </span>
          <span
            className="font-mono text-[13px] font-semibold text-ink"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            {stockPct}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-line overflow-hidden">
          <div
            className={`h-full ${stockColor} rounded-full transition-all`}
            style={{ width: `${stockPct}%` }}
          />
        </div>
      </div>
    </article>
  );
}
