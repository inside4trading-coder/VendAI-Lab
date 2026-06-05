import { useLeads } from "@/hooks/crm/useLeads";

interface Props {
  leadId: string | null;
  locationLabel: string | null;
  onChange: (patch: { leadId: string | null; locationLabel: string | null }) => void;
}

export function LocationPicker({ leadId, locationLabel, onChange }: Props) {
  const { data: leads = [] } = useLeads();
  const mode = leadId ? "lead" : "libre";

  return (
    <div className="space-y-2">
      <div className="inline-flex bg-panel border border-line rounded-full p-1">
        <button
          type="button"
          onClick={() => onChange({ leadId: null, locationLabel })}
          className={`font-mono text-[10.5px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full transition-colors ${
            mode === "libre" ? "bg-paper text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
          }`}
        >
          Texto libre
        </button>
        <button
          type="button"
          onClick={() => onChange({ leadId: leads[0]?.id ?? null, locationLabel: null })}
          className={`font-mono text-[10.5px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full transition-colors ${
            mode === "lead" ? "bg-paper text-ink shadow-sm" : "text-muted-foreground hover:text-ink"
          }`}
        >
          Vincular a lead
        </button>
      </div>

      {mode === "libre" ? (
        <input
          value={locationLabel ?? ""}
          onChange={(e) => onChange({ leadId: null, locationLabel: e.target.value || null })}
          placeholder="Ej. Anytime Fitness Hortaleza"
          className="form-input"
        />
      ) : (
        <select
          value={leadId ?? ""}
          onChange={(e) => onChange({ leadId: e.target.value || null, locationLabel: null })}
          className="form-input"
        >
          <option value="">— Selecciona una ubicación —</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} {l.status ? `· ${l.status}` : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
