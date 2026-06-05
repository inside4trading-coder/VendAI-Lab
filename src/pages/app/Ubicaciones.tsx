import { useEffect, useMemo, useState } from "react";
import { Search, Plus, LayoutGrid, Table2, Database, Loader2, Upload } from "lucide-react";
import { useLeads, useBulkSeedLeads } from "@/hooks/crm/useLeads";
import { LEAD_CATEGORIES, LEAD_STATUSES, DISCOVERY_QUESTIONS, type Lead } from "@/lib/crm";
import { discoveryCount } from "@/components/app/crm/DiscoveryProgress";
import { LeadsTable } from "@/components/app/crm/LeadsTable";
import { LeadsKanban } from "@/components/app/crm/LeadsKanban";
import { LeadDrawer } from "@/components/app/crm/LeadDrawer";
import { LeadForm } from "@/components/app/crm/LeadForm";
import { ImportLeadsDialog } from "@/components/app/crm/ImportLeadsDialog";
import { useToast } from "@/hooks/use-toast";


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

export default function Ubicaciones() {
  const { data: leads = [], isLoading } = useLeads();
  const seed = useBulkSeedLeads();
  const { toast } = useToast();

  const [view, setView] = useState<"tabla" | "kanban">("tabla");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"Todos" | string>("Todos");
  const [st, setSt] = useState<"Todos" | string>("Todos");

  const [openLead, setOpenLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formLead, setFormLead] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);


  useEffect(() => {
    document.title = "CRM · VendAI";
  }, []);

  // Mantener `openLead` sincronizado con los datos frescos del query
  useEffect(() => {
    if (!openLead) return;
    const fresh = leads.find((l) => l.id === openLead.id);
    if (fresh && fresh !== openLead) setOpenLead(fresh);
  }, [leads, openLead]);

  const counts = useMemo(() => {
    const totalQs = DISCOVERY_QUESTIONS.length;
    const totalAnswered = leads.reduce((acc, l) => acc + discoveryCount(l.discovery), 0);
    const pct = leads.length === 0 ? 0 : Math.round((totalAnswered / (leads.length * totalQs)) * 100);
    return {
      total: leads.length,
      nuevo: leads.filter((l) => l.status === "Nuevo").length,
      contactado: leads.filter((l) => l.status === "Contactado").length,
      reunion: leads.filter((l) => l.status === "Reunión Agendada").length,
      ganado: leads.filter((l) => l.status === "Ganado").length,
      discoveryPct: pct,
    };
  }, [leads]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (cat !== "Todos" && l.category !== cat) return false;
      if (st !== "Todos" && l.status !== st) return false;
      if (!term) return true;
      return (
        l.name.toLowerCase().includes(term) ||
        (l.address ?? "").toLowerCase().includes(term) ||
        (l.phone ?? "").toLowerCase().includes(term) ||
        (l.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [q, cat, st, leads]);

  const openDrawer = (lead: Lead) => {
    setOpenLead(lead);
    setDrawerOpen(true);
  };

  const openNewForm = () => {
    setFormLead(null);
    setFormOpen(true);
  };

  const handleSeed = async () => {
    try {
      await seed.mutateAsync();
      toast({ title: "10 leads de ejemplo cargados" });
    } catch (err: unknown) {
      toast({
        title: "No pudimos cargar los ejemplos",
        description: err instanceof Error ? err.message : "Inténtalo de nuevo",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="container py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="eyebrow">Lab · CRM</span>
          <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] leading-tight tracking-tight text-ink">
            Prospección de Ubicaciones
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-xl">
            Pipeline de locales para instalación de máquinas.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <div className="inline-flex bg-panel border border-line rounded-full p-1">
            <button
              onClick={() => setView("tabla")}
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full transition-colors ${view === "tabla" ? "bg-paper text-ink shadow-sm" : "text-muted-foreground hover:text-ink"}`}
            >
              <Table2 className="h-3.5 w-3.5" /> Tabla
            </button>
            <button
              onClick={() => {
                setView("kanban");
                setQ("");
                setCat("Todos");
                setSt("Todos");
              }}
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full transition-colors ${view === "kanban" ? "bg-paper text-ink shadow-sm" : "text-muted-foreground hover:text-ink"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </button>
          </div>

          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 border border-line hover:border-ink/30 text-ink font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 transition-colors"
          >
            <Upload className="h-4 w-4" /> Importar
          </button>
          <button
            onClick={openNewForm}
            className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Añadir lead
          </button>
        </div>
      </div>


      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Leads" value={counts.total} />
        <MetricCard label="Nuevos" value={counts.nuevo} dotClass="bg-muted-ink" />
        <MetricCard label="Contactados" value={counts.contactado} dotClass="bg-signal-blue" />
        <MetricCard label="Reuniones" value={counts.reunion} dotClass="bg-ventures-violet" />
        <MetricCard label="Ganados" value={counts.ganado} dotClass="bg-crypto-green" />
        <MetricCard label="Discovery" value={`${counts.discoveryPct}%`} dotClass="bg-cyan" />
      </div>

      {/* Controls (solo en vista Tabla) */}
      {view === "tabla" && (
        <div className="bg-paper border border-line rounded-xl p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, dirección, teléfono o email…"
              className="form-input pl-10"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="form-input md:w-44"
          >
            <option value="Todos">Todas las categorías</option>
            {LEAD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={st}
            onChange={(e) => setSt(e.target.value)}
            className="form-input md:w-52"
          >
            <option value="Todos">Todos los estados</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}


      {/* Loading */}
      {isLoading && (
        <div className="bg-paper border border-line rounded-xl p-12 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-mono text-[12px] tracking-[0.06em] uppercase">Cargando leads…</span>
        </div>
      )}

      {/* Empty state global */}
      {!isLoading && leads.length === 0 && (
        <div className="panel min-h-[360px] flex flex-col items-center justify-center text-center p-12 gap-5">
          <div className="h-16 w-16 rounded-full bg-line/70 flex items-center justify-center">
            <Database className="h-7 w-7 text-faint" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-ink">
              Aún no tienes leads
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Empieza añadiendo tu primer prospecto o carga 10 ejemplos para explorar el CRM.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openNewForm}
              className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors"
            >
              <Plus className="h-4 w-4" /> Añadir tu primer lead
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-2 border border-line hover:border-ink/30 font-mono text-[12px] tracking-[0.08em] uppercase text-ink rounded-full px-4 py-2.5 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" /> Importar desde Excel
            </button>
            <button
              onClick={handleSeed}
              disabled={seed.isPending}
              className="inline-flex items-center gap-2 border border-line hover:border-ink/30 font-mono text-[12px] tracking-[0.08em] uppercase text-ink rounded-full px-4 py-2.5 transition-colors disabled:opacity-60"
            >
              {seed.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Cargar 10 ejemplos
            </button>
          </div>
        </div>
      )}

      {/* Views */}
      {!isLoading && leads.length > 0 && (
        <>
          {view === "tabla" ? (
            <LeadsTable leads={filtered} onOpen={openDrawer} />
          ) : (
            <LeadsKanban leads={leads} onOpen={openDrawer} />
          )}

        </>
      )}

      <LeadDrawer
        lead={openLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={(l) => {
          setFormLead(l);
          setFormOpen(true);
        }}
      />
      <LeadForm open={formOpen} onOpenChange={setFormOpen} lead={formLead} />
      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} />
    </section>
  );
}
