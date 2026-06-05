import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Cpu, Search, Loader2 } from "lucide-react";

import { useMachines } from "@/hooks/machines/useMachines";
import { useAllMachineProducts } from "@/hooks/machines/useMachineProducts";
import { useAllMachineSales } from "@/hooks/machines/useMachineSales";
import { useLeads } from "@/hooks/crm/useLeads";
import {
  MACHINE_STATUSES,
  computeStockPercent,
  computeSalesToday,
  type Machine,
} from "@/lib/machines";
import { MachineCard } from "@/components/app/machines/MachineCard";
import { MachineForm } from "@/components/app/machines/MachineForm";
import { MachineDrawer } from "@/components/app/machines/MachineDrawer";

function MetricCard({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number | string;
  dotClass?: string;
}) {
  return (
    <div className="bg-paper border border-line rounded-xl p-4">
      <div className="flex items-center gap-2">
        {dotClass && <span className={`h-2 w-2 rounded-full ${dotClass}`} />}
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className="mt-2 text-[26px] font-bold tracking-tight text-ink"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {value}
      </p>
    </div>
  );
}

export default function Maquinas() {
  const { data: machines = [], isLoading } = useMachines();
  const { data: products = [] } = useAllMachineProducts();
  const { data: sales = [] } = useAllMachineSales();
  const { data: leads = [] } = useLeads();

  const [q, setQ] = useState("");
  const [st, setSt] = useState<"Todos" | string>("Todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMachine, setOpenMachine] = useState<Machine | null>(null);
  const [presetLeadId, setPresetLeadId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Máquinas · VendAI";
  }, []);

  useEffect(() => {
    const newWithLead = searchParams.get("newWithLead");
    if (newWithLead) {
      setPresetLeadId(newWithLead);
      setEditing(null);
      setFormOpen(true);
      searchParams.delete("newWithLead");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);


  useEffect(() => {
    if (!openMachine) return;
    const fresh = machines.find((m) => m.id === openMachine.id);
    if (fresh && fresh !== openMachine) setOpenMachine(fresh);
  }, [machines, openMachine]);

  const productsByMachine = useMemo(() => {
    const m: Record<string, typeof products> = {};
    for (const p of products) (m[p.machine_id] ||= []).push(p);
    return m;
  }, [products]);

  const salesByMachine = useMemo(() => {
    const m: Record<string, typeof sales> = {};
    for (const s of sales) (m[s.machine_id] ||= []).push(s);
    return m;
  }, [sales]);

  const counts = useMemo(() => {
    const total = machines.length;
    const active = machines.filter((m) => m.status === "Activa").length;
    const maint = machines.filter((m) => m.status === "Mantenimiento").length;
    const salesToday = machines.reduce(
      (acc, m) => acc + computeSalesToday(salesByMachine[m.id] ?? []),
      0,
    );
    const stockPcts = machines.map((m) => computeStockPercent(productsByMachine[m.id] ?? []));
    const stockAvg = stockPcts.length
      ? Math.round(stockPcts.reduce((a, b) => a + b, 0) / stockPcts.length)
      : 0;
    return { total, active, maint, salesToday, stockAvg };
  }, [machines, salesByMachine, productsByMachine]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return machines.filter((m) => {
      if (st !== "Todos" && m.status !== st) return false;
      if (!term) return true;
      const lead = m.lead_id ? leads.find((l) => l.id === m.lead_id) : null;
      return (
        m.name.toLowerCase().includes(term) ||
        m.code.toLowerCase().includes(term) ||
        (m.model ?? "").toLowerCase().includes(term) ||
        (m.location_label ?? "").toLowerCase().includes(term) ||
        (lead?.name ?? "").toLowerCase().includes(term)
      );
    });
  }, [machines, q, st, leads]);

  const openDrawer = (m: Machine) => {
    setOpenMachine(m);
    setDrawerOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setPresetLeadId(null);
    setFormOpen(true);
  };


  return (
    <section className="container py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="eyebrow">Lab · Máquinas</span>
          <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] leading-tight tracking-tight text-ink">
            Inventario de Máquinas
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-xl">
            Estado y gestión de tu flota de máquinas.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors self-start"
        >
          <Plus className="h-4 w-4" /> Añadir máquina
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Total" value={counts.total} />
        <MetricCard label="Activas" value={counts.active} dotClass="bg-crypto-green" />
        <MetricCard label="Mantenimiento" value={counts.maint} dotClass="bg-amber-400" />
        <MetricCard label="Stock medio" value={`${counts.stockAvg}%`} dotClass="bg-signal-blue" />
        <MetricCard label="Ventas hoy" value={counts.salesToday} dotClass="bg-cyan" />
      </div>

      {machines.length > 0 && (
        <div className="bg-paper border border-line rounded-xl p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, código, modelo o ubicación…"
              className="form-input pl-10"
            />
          </div>
          <select value={st} onChange={(e) => setSt(e.target.value)} className="form-input md:w-52">
            <option value="Todos">Todos los estados</option>
            {MACHINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && (
        <div className="bg-paper border border-line rounded-xl p-12 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-mono text-[12px] uppercase tracking-[0.06em]">
            Cargando máquinas…
          </span>
        </div>
      )}

      {!isLoading && machines.length === 0 && (
        <div className="panel min-h-[360px] flex flex-col items-center justify-center text-center p-12 gap-5">
          <div className="h-16 w-16 rounded-full bg-line/70 flex items-center justify-center">
            <Cpu className="h-7 w-7 text-faint" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-ink">
              Aún no hay máquinas
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Añade tu primera máquina para empezar a gestionar inventario, ventas y servicios.
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Añadir tu primera máquina
          </button>
        </div>
      )}

      {!isLoading && machines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MachineCard
              key={m.id}
              machine={m}
              lead={m.lead_id ? leads.find((l) => l.id === m.lead_id) : undefined}
              products={productsByMachine[m.id] ?? []}
              sales={salesByMachine[m.id] ?? []}
              onOpen={() => openDrawer(m)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12 font-mono text-[11px] uppercase tracking-[0.1em]">
              Sin resultados
            </div>
          )}
        </div>
      )}

      <MachineForm
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setPresetLeadId(null);
        }}
        machine={editing}
        defaultLeadId={presetLeadId}
      />

      <MachineDrawer
        machine={openMachine}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={(m) => {
          setEditing(m);
          setFormOpen(true);
        }}
      />
    </section>
  );
}
