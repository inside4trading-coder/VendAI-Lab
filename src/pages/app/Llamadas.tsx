import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Calendar, Download, Loader2, Phone, Play, RefreshCw, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useCallsData, useSyncCalls } from "@/hooks/calls/useCallsData";
import type { CallPeriod, CallRecord, DateRange } from "@/lib/calls";

const periods: { key: Exclude<CallPeriod, "custom">; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "7 días" },
  { key: "month", label: "30 días" },
];

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  answered: { label: "Contestada", className: "bg-crypto-green/10 text-crypto-green" },
  no_answer: { label: "Sin respuesta", className: "bg-panel text-muted-foreground" },
  busy: { label: "Ocupado", className: "bg-cyan/10 text-cyan" },
  missed: { label: "Perdida", className: "bg-destructive/10 text-destructive" },
};

const DIRECTION_LABELS: Record<string, string> = {
  incoming: "↙ Entrante",
  outgoing: "↗ Saliente",
  internal: "↔ Interna",
};

const eur2 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const pct1 = (n: number) => `${n.toFixed(1)}%`;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const pillBase =
  "inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full transition-colors";
const thClass =
  "text-left font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground px-4 py-3 whitespace-nowrap";
const thRight = `${thClass} text-right`;
const tdClass = "px-4 py-3 whitespace-nowrap";

function MetricCard({ label, value, dotClass }: { label: string; value: string | number; dotClass?: string }) {
  return (
    <div className="bg-paper border border-line rounded-xl p-4">
      <div className="flex items-center gap-2">
        {dotClass && <span className={`h-2 w-2 rounded-full ${dotClass}`} />}
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">{label}</p>
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-paper border border-line rounded-xl p-5">
      <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink mb-4">{title}</h2>
      {children}
    </div>
  );
}

function RecordingCell({
  call,
  playing,
  onPlay,
  onStop,
}: {
  call: CallRecord;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
}) {
  if (!call.is_recorded || !call.recording_url) {
    return <span className="text-muted-foreground">—</span>;
  }
  const download = (
    <a
      href={call.recording_url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-ink"
      title="Descargar"
    >
      <Download className="h-3.5 w-3.5" />
    </a>
  );
  return (
    <div className="flex items-center gap-2">
      {playing ? (
        <>
          <audio controls autoPlay src={call.recording_url} className="h-8 max-w-[220px]" onEnded={onStop} />
          <button onClick={onStop} title="Cerrar" className="text-muted-foreground hover:text-ink">
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <button
          onClick={onPlay}
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-signal-blue hover:text-ink"
        >
          <Play className="h-3.5 w-3.5" /> Oír
        </button>
      )}
      {download}
    </div>
  );
}

export default function Llamadas() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<CallPeriod>("month");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useCallsData(period, customRange);
  const sync = useSyncCalls();

  useEffect(() => {
    document.title = "Llamadas · VendAI";
  }, []);

  const handleSync = () =>
    sync.mutate(
      { period, customRange },
      {
        onSuccess: (synced) => toast({ title: `Sincronización completada: ${synced} llamadas` }),
        onError: (err) =>
          toast({
            title: "Error sincronizando llamadas",
            description: err instanceof Error ? err.message : "Inténtalo de nuevo",
            variant: "destructive",
          }),
      },
    );

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    setCustomRange({ start: new Date(`${customFrom}T00:00:00`), end: new Date(`${customTo}T23:59:59`) });
    setPeriod("custom");
  };

  const syncIcon = sync.isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <RefreshCw className="h-4 w-4" />
  );

  const isEmpty = !data || data.kpis.totalCalls === 0;

  return (
    <section className="w-full px-6 lg:px-10 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="eyebrow">Lab · Llamadas</span>
          <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] leading-tight tracking-tight text-ink">Llamadas</h1>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-xl">
            Seguimiento y análisis de llamadas del equipo (Zadarma).
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={sync.isPending}
          className="self-start inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors disabled:opacity-60"
        >
          {syncIcon} Sincronizar
        </button>
      </div>

      {/* Filtros de periodo */}
      <div className="inline-flex flex-wrap items-center bg-panel border border-line rounded-full p-1">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              setPeriod(p.key);
              setCustomRange(undefined);
            }}
            className={`${pillBase} ${period === p.key ? "bg-paper text-ink shadow-sm" : "text-muted-foreground hover:text-ink"}`}
          >
            {p.label}
          </button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`${pillBase} ${period === "custom" ? "bg-paper text-ink shadow-sm" : "text-muted-foreground hover:text-ink"}`}
            >
              <Calendar className="h-3.5 w-3.5" /> Personalizado
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 space-y-3" align="start">
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground mb-1.5">
                Desde
              </span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground mb-1.5">
                Hasta
              </span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="form-input"
              />
            </label>
            <button
              onClick={handleCustomApply}
              disabled={!customFrom || !customTo}
              className="w-full bg-ink text-paper font-mono text-[11px] tracking-[0.08em] uppercase rounded-full px-4 py-2 hover:bg-ink-2 transition-colors disabled:opacity-50"
            >
              Aplicar
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="bg-paper border border-line rounded-xl flex flex-col items-center justify-center py-16 gap-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Error cargando llamadas"}</p>
          <button onClick={() => refetch()} className={`${pillBase} border border-line text-ink hover:border-ink/30`}>
            Reintentar
          </button>
        </div>
      ) : isEmpty ? (
        <div className="bg-paper border border-line rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <Phone className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="font-mono font-semibold text-[16px] text-ink">Sin llamadas en este periodo</h3>
          <p className="text-muted-foreground text-[14px] mt-1">
            Sincroniza tus llamadas desde Zadarma para ver datos aquí.
          </p>
          <button
            onClick={handleSync}
            disabled={sync.isPending}
            className="mt-5 inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors disabled:opacity-60"
          >
            {syncIcon} Sincronizar ahora
          </button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard label="Total llamadas" value={data.kpis.totalCalls} />
            <MetricCard label="Válidas" value={data.kpis.validCalls} dotClass="bg-crypto-green" />
            <MetricCard label="Contestación" value={pct1(data.kpis.answerRate)} dotClass="bg-signal-blue" />
            <MetricCard label="Validez" value={pct1(data.kpis.validRate)} dotClass="bg-ventures-violet" />
            <MetricCard label="Minutos" value={data.kpis.minutesTalked} dotClass="bg-cyan" />
            <MetricCard label="Coste" value={eur2.format(data.kpis.totalCost)} />
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel title="Evolución diaria">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Total" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="answered" name="Contestadas" stroke="hsl(var(--signal-blue))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="valid" name="Válidas" stroke="hsl(var(--crypto-green))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Llamadas por hora">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}h`} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip labelFormatter={(v: number) => `${v}:00 – ${v}:59`} />
                    <Bar dataKey="count" name="Llamadas" fill="hsl(var(--signal-blue))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* Rendimiento por agente */}
          {data.agentData.length > 0 && (
            <div className="bg-paper border border-line rounded-xl overflow-hidden">
              <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink px-5 pt-5 pb-3">
                Rendimiento por agente
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-[14px]">
                  <thead>
                    <tr className="border-y border-line bg-panel/50">
                      <th className={thClass}>Agente</th>
                      <th className={thRight}>Total</th>
                      <th className={thRight}>Contestadas</th>
                      <th className={thRight}>Perdidas</th>
                      <th className={thRight}>Válidas</th>
                      <th className={thRight}>Minutos</th>
                      <th className={thRight}>Dur. media</th>
                      <th className={thRight}>% Validez</th>
                      <th className={thRight}>% Contest.</th>
                      <th className={thRight}>Coste</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[13px]">
                    {data.agentData.map((a) => (
                      <tr key={a.agent} className="border-b border-line/70 last:border-0 hover:bg-panel/60">
                        <td className={`${tdClass} font-sans text-[14px] text-ink font-medium`}>{a.agent}</td>
                        <td className={`${tdClass} text-right`}>{a.total}</td>
                        <td className={`${tdClass} text-right`}>{a.answered}</td>
                        <td className={`${tdClass} text-right`}>{a.missed}</td>
                        <td className={`${tdClass} text-right`}>{a.valid}</td>
                        <td className={`${tdClass} text-right`}>{a.minutes}</td>
                        <td className={`${tdClass} text-right`}>{a.avgDuration} min</td>
                        <td className={`${tdClass} text-right`}>{a.validRate}%</td>
                        <td className={`${tdClass} text-right`}>{a.answerRate}%</td>
                        <td className={`${tdClass} text-right`}>{eur2.format(a.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Llamadas recientes */}
          <div className="bg-paper border border-line rounded-xl overflow-hidden">
            <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink px-5 pt-5 pb-3">
              Llamadas recientes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-[14px]">
                <thead>
                  <tr className="border-y border-line bg-panel/50">
                    <th className={thClass}>Fecha/Hora</th>
                    <th className={thClass}>Origen</th>
                    <th className={thClass}>Destino</th>
                    <th className={thClass}>Dirección</th>
                    <th className={thClass}>Estado</th>
                    <th className={thRight}>Duración</th>
                    <th className={thRight}>Coste</th>
                    <th className={thClass}>Grabación</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCalls.map((c) => {
                    const st = STATUS_BADGES[c.status ?? ""] ?? STATUS_BADGES.no_answer;
                    return (
                      <tr key={c.id} className="border-b border-line/70 last:border-0 hover:bg-panel/60">
                        <td className={`${tdClass} font-mono text-[13px]`}>{formatDateTime(c.call_start)}</td>
                        <td className={`${tdClass} font-mono text-[13px]`}>{c.caller || "—"}</td>
                        <td className={`${tdClass} font-mono text-[13px]`}>{c.destination || "—"}</td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {DIRECTION_LABELS[c.direction ?? ""] ?? DIRECTION_LABELS.outgoing}
                        </td>
                        <td className={tdClass}>
                          <span
                            className={`inline-flex font-mono text-[10.5px] tracking-[0.08em] uppercase rounded-full px-2.5 py-1 ${st.className}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className={`${tdClass} text-right font-mono text-[13px]`}>{formatDuration(c.duration)}</td>
                        <td className={`${tdClass} text-right font-mono text-[13px]`}>{eur2.format(Number(c.cost) || 0)}</td>
                        <td className={tdClass}>
                          <RecordingCell
                            call={c}
                            playing={playingId === c.id}
                            onPlay={() => setPlayingId(c.id)}
                            onStop={() => setPlayingId(null)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
