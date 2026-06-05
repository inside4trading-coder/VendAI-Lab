import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  TrendingUp,
  MapPin,
  Calendar,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLeads } from "@/hooks/crm/useLeads";
import { useMachines } from "@/hooks/machines/useMachines";
import {
  useDashboardData,
  formatRelative,
  formatNextWhen,
  type ActivityKind,
} from "@/hooks/useDashboardData";

const activityColor: Record<ActivityKind, string> = {
  lead: "bg-ventures-violet",
  service: "bg-signal-blue",
  sale: "bg-crypto-green",
};

const currencyEUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});


type Accent = "signal-blue" | "crypto-green" | "ventures-violet" | "cyan";

const accentMap: Record<Accent, { bar: string; bg: string; text: string }> = {
  "signal-blue": {
    bar: "border-l-signal-blue",
    bg: "bg-signal-blue/10",
    text: "text-signal-blue",
  },
  "crypto-green": {
    bar: "border-l-crypto-green",
    bg: "bg-crypto-green/10",
    text: "text-crypto-green",
  },
  "ventures-violet": {
    bar: "border-l-ventures-violet",
    bg: "bg-ventures-violet/10",
    text: "text-ventures-violet",
  },
  cyan: {
    bar: "border-l-cyan",
    bg: "bg-cyan/10",
    text: "text-cyan",
  },
};

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: Accent;
}) {
  const a = accentMap[accent];
  return (
    <div
      className={`bg-paper border border-line border-l-[3px] ${a.bar} rounded-xl p-5 flex items-start justify-between gap-4`}
    >
      <div className="min-w-0">
        <p className="eyebrow text-[10.5px]">{label}</p>
        <p
          className="mt-2 text-[34px] leading-none font-bold tracking-tight text-ink"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {value}
        </p>
      </div>
      <div
        className={`h-10 w-10 rounded-full ${a.bg} ${a.text} flex items-center justify-center flex-none`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
    </div>
  );
}

const pipelineConfig: { label: string; status: string; color: string }[] = [
  { label: "Nuevos", status: "Nuevo", color: "bg-muted-ink/60" },
  { label: "Contactados", status: "Contactado", color: "bg-signal-blue" },
  { label: "Reuniones agendadas", status: "Reunión Agendada", color: "bg-ventures-violet" },
  { label: "Negociación", status: "Negociación", color: "bg-cyan" },
  { label: "Ganados", status: "Ganado", color: "bg-crypto-green" },
  { label: "Descartados", status: "Descartado", color: "bg-destructive/70" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: leads = [] } = useLeads();
  const { data: machines = [] } = useMachines();
  const { data: dash } = useDashboardData();
  const activeMachines = useMemo(() => machines.filter((m) => m.status === "Activa").length, [machines]);
  const wonLeads = useMemo(() => leads.filter((l) => l.status === "Ganado").length, [leads]);
  const pendingMeetings = useMemo(
    () => leads.filter((l) => l.next_action_at && new Date(l.next_action_at) >= new Date()).length,
    [leads],
  );



  useEffect(() => {
    document.title = "Dashboard · VendAI";
  }, []);

  const nombre = useMemo(() => {
    const meta = (user?.user_metadata as Record<string, unknown> | undefined) ?? {};
    return (
      (meta.full_name as string) ||
      (meta.name as string) ||
      user?.email?.split("@")[0] ||
      "operador"
    );
  }, [user]);

  const fecha = useMemo(() => {
    const f = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return f.charAt(0).toUpperCase() + f.slice(1);
  }, []);

  const saludo = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 21) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const pipeline = useMemo(
    () =>
      pipelineConfig.map((c) => ({
        ...c,
        value: leads.filter((l) => l.status === c.status).length,
      })),
    [leads],
  );
  const totalPipeline = pipeline.reduce((s, p) => s + p.value, 0) || 1;

  return (
    <section className="container py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="eyebrow">Lab · Dashboard</span>
        <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] leading-tight tracking-tight text-ink">
          {saludo}, <span className="text-signal">{nombre}</span>
        </h1>
        <p className="mt-2 font-mono text-[12.5px] tracking-[0.04em] text-muted-foreground">
          {fecha}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Máquinas activas" value={String(activeMachines)} icon={Cpu} accent="signal-blue" />
        <MetricCard
          label="Ventas este mes"
          value={currencyEUR.format(dash?.salesThisMonth ?? 0)}
          icon={TrendingUp}
          accent="crypto-green"
        />
        <MetricCard label="Ubicaciones ganadas" value={String(wonLeads)} icon={MapPin} accent="ventures-violet" />
        <MetricCard label="Reuniones pendientes" value={String(pendingMeetings)} icon={Calendar} accent="cyan" />

      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Actividad reciente */}
        <div className="bg-paper border border-line rounded-xl p-6">
          <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink mb-5">
            Actividad reciente
          </h2>
          {dash?.recentActivity.length ? (
            <ul className="space-y-4">
              {dash.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 rounded-full flex-none ${activityColor[a.kind]}`} />
                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
                    <p className="text-[14px] text-ink truncate">{a.text}</p>
                    <span className="font-mono text-[11px] text-muted-foreground flex-none">
                      {formatRelative(a.occurredAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] text-muted-foreground">
              Aún no hay actividad registrada.
            </p>
          )}
        </div>

        {/* Pipeline */}
        <div className="bg-paper border border-line rounded-xl p-6">
          <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink mb-5">
            Pipeline de prospección
          </h2>
          <ul className="space-y-4">
            {pipeline.map((p) => {
              const pct = Math.max(4, Math.round((p.value / totalPipeline) * 100));
              return (
                <li key={p.label}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[13.5px] text-ink">{p.label}</span>
                    <span
                      className="font-mono text-[13px] text-ink font-semibold"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {p.value}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Próximo paso */}
      <div className="relative overflow-hidden rounded-xl border border-line p-6">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(43,127,245,0.08)_0%,rgba(31,182,232,0.06)_52%,rgba(70,228,207,0.08)_100%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="eyebrow">Próximo paso</span>
            {dash?.nextAction ? (
              <p className="mt-2 text-[16px] md:text-[17px] text-ink">
                {dash.nextAction.note ? `${dash.nextAction.note} con ` : "Acción con "}
                <span className="font-semibold">{dash.nextAction.name}</span> —{" "}
                <span className="font-mono text-[14px]">
                  {formatNextWhen(dash.nextAction.when)}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-[16px] md:text-[17px] text-muted-foreground">
                No tienes próximas acciones programadas.
              </p>
            )}
          </div>
          <Link
            to="/app/ubicaciones"
            className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.06em] uppercase rounded-lg px-4 py-2.5 hover:bg-ink-2 transition-colors self-start md:self-auto"
          >
            {dash?.nextAction ? "Ver detalles" : "Ir al CRM"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
