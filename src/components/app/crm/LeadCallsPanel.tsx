import { useState } from "react";
import { Loader2, Phone } from "lucide-react";
import { CallStatusBadge, RecordingCell } from "@/components/app/calls/callUi";
import { useLeadCalls } from "@/hooks/calls/useLeadCalls";
import { DIRECTION_LABELS, formatCost, formatDateTime, formatDuration } from "@/lib/callFormat";
import { summarizeLeadCalls } from "@/lib/leadCalls";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line px-3 py-2">
      <p className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}

/** Llamadas de Zadarma vinculadas al lead por su teléfono. */
export function LeadCallsPanel({ leadId, phone }: { leadId: string; phone: string | null }) {
  const { data: calls = [], isLoading } = useLeadCalls(leadId);
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-2">
        <Phone className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-[13px] text-muted-foreground">
          {phone ? "Sin llamadas registradas con este teléfono." : "Añade un teléfono al lead para vincular sus llamadas."}
        </p>
        <p className="text-[12px] text-muted-foreground/80">
          Las llamadas se vinculan solas por número al sincronizar desde Llamadas.
        </p>
      </div>
    );
  }

  const summary = summarizeLeadCalls(calls);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Llamadas" value={summary.total} />
        <Stat label="Contestadas" value={summary.answered} />
        <Stat label="Minutos" value={summary.talkMinutes} />
        <Stat label="Coste" value={formatCost(summary.totalCost, summary.costCurrency)} />
      </div>
      {summary.lastCallAt && (
        <p className="font-mono text-[11px] text-muted-foreground">
          Última llamada: {formatDateTime(summary.lastCallAt)}
        </p>
      )}

      <ul className="divide-y divide-line border border-line rounded-lg">
        {calls.map((c) => (
          <li key={c.id} className="px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[12.5px] text-ink">{formatDateTime(c.call_start)}</span>
              <CallStatusBadge status={c.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
              <span>{DIRECTION_LABELS[c.direction ?? ""] ?? DIRECTION_LABELS.outgoing}</span>
              <span className="font-mono">{formatDuration(c.duration)}</span>
              {c.agent_name && <span>{c.agent_name}</span>}
              <span className="font-mono">{formatCost(c.cost, c.cost_currency ?? summary.costCurrency)}</span>
            </div>
            {c.is_recorded && c.recording_url && (
              <RecordingCell
                call={c}
                playing={playingId === c.id}
                onPlay={() => setPlayingId(c.id)}
                onStop={() => setPlayingId(null)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
