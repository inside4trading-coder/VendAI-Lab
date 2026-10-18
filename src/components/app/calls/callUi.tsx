import { Download, Play, X } from "lucide-react";

/** Componentes de llamadas compartidos por la página Llamadas y la ficha del lead. */

interface PlayableCall {
  is_recorded: boolean;
  recording_url: string | null;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  answered: { label: "Contestada", className: "bg-crypto-green/10 text-crypto-green" },
  no_answer: { label: "Sin respuesta", className: "bg-panel text-muted-foreground" },
  busy: { label: "Ocupado", className: "bg-cyan/10 text-cyan" },
  missed: { label: "Perdida", className: "bg-destructive/10 text-destructive" },
};

export function CallStatusBadge({ status }: { status: string | null }) {
  const st = STATUS_BADGES[status ?? ""] ?? STATUS_BADGES.no_answer;
  return (
    <span
      className={`inline-flex font-mono text-[10.5px] tracking-[0.08em] uppercase rounded-full px-2.5 py-1 ${st.className}`}
    >
      {st.label}
    </span>
  );
}

export function RecordingCell({
  call,
  playing,
  onPlay,
  onStop,
}: {
  call: PlayableCall;
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
