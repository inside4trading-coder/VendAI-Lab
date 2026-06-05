import { useState } from "react";
import type { Lead } from "@/lib/crm";
import { LEAD_STATUSES, statusStyles } from "@/lib/crm";
import { LeadCard } from "./LeadCard";
import { useUpdateLead } from "@/hooks/crm/useLeads";
import { useCreateActivity } from "@/hooks/crm/useLeadActivities";

interface Props {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
}

export function LeadsKanban({ leads, onOpen }: Props) {
  const update = useUpdateLead();
  const createActivity = useCreateActivity();
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDrop = async (status: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/plain");
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    await update.mutateAsync({ id, patch: { status } });
    createActivity.mutate({
      lead_id: id,
      type: "cambio_estado",
      title: `Estado cambiado a "${status}"`,
      body: `Antes: ${lead.status}`,
    });
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex lg:grid gap-3 min-w-max lg:min-w-0" style={{ gridTemplateColumns: `repeat(${LEAD_STATUSES.length}, minmax(0, 1fr))` }}>
        {LEAD_STATUSES.map((status) => {
          const items = leads.filter((l) => l.status === status);
          const st = statusStyles[status];
          const isOver = dragOver === status;
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(status);
              }}
              onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
              onDrop={(e) => handleDrop(status, e)}
              className={`w-[280px] lg:w-auto flex-none lg:flex-1 min-w-0 bg-panel border border-line border-t-[3px] ${st.col} rounded-xl flex flex-col max-h-[calc(100vh-220px)] transition-colors ${isOver ? "bg-line/40" : ""}`}
            >
              <header className="px-3 py-3 flex items-center justify-between border-b border-line/70 sticky top-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot} flex-none`} />
                  <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-ink truncate">
                    {status}
                  </span>
                </div>
                <span
                  className="font-mono text-[11px] text-muted-foreground"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {items.length}
                </span>
              </header>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onOpen={() => onOpen(lead)}
                    onDragStart={() => {}}
                  />
                ))}
                {items.length === 0 && (
                  <div className="text-center font-mono text-[10.5px] tracking-[0.1em] uppercase text-faint py-6">
                    Vacío
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

