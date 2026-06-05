import { Phone, Star, Calendar, Mail, MapPin } from "lucide-react";
import type { Lead } from "@/lib/crm";
import { DiscoveryProgress } from "./DiscoveryProgress";

interface Props {
  lead: Lead;
  onOpen: () => void;
  onDragStart: () => void;
}

export function LeadCard({ lead, onOpen, onDragStart }: Props) {
  const next = lead.next_action_at
    ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(
        new Date(lead.next_action_at),
      )
    : null;

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", lead.id);
        onDragStart();
      }}
      onClick={onOpen}
      className="group bg-paper border border-line rounded-lg p-4 cursor-pointer hover:border-ink/30 hover:shadow-[0_6px_20px_-12px_rgba(14,17,22,0.18)] transition-all active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-[15px] font-medium text-ink leading-snug">{lead.name}</h4>
          <p className="mt-0.5 font-mono text-[10.5px] tracking-[0.06em] uppercase text-muted-foreground">
            {lead.category}
          </p>
        </div>
        {lead.rating && lead.rating > 0 && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-ink-2 flex-none">
            <Star className="h-3 w-3 text-amber-400" fill="currentColor" strokeWidth={0} />
            {Number(lead.rating).toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-2">
        <DiscoveryProgress discovery={lead.discovery} variant="pill" />
      </div>

      {lead.address && (
        <p className="mt-3 text-[12.5px] text-muted-foreground flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 flex-none mt-0.5" />
          <span>{lead.address}</span>
        </p>
      )}

      {(lead.phone || lead.email) && (
        <div className="mt-2 space-y-1">
          {lead.phone && (
            <a
              href={`tel:${lead.phone.replace(/\s/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[12.5px] text-ink-2 hover:text-signal-blue"
            >
              <Phone className="h-3.5 w-3.5" />
              {lead.phone}
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[12.5px] text-ink-2 hover:text-signal-blue truncate"
            >
              <Mail className="h-3.5 w-3.5 flex-none" />
              <span className="truncate">{lead.email}</span>
            </a>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {lead.owner_name ? (
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-faint truncate">
            {lead.owner_name}
          </span>
        ) : <span />}
        {next && (
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-ink-2 bg-panel rounded-full px-2 py-0.5">
            <Calendar className="h-3 w-3" />
            {next}
          </span>
        )}
      </div>
    </article>
  );
}

