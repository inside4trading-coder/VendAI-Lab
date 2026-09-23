import { forwardRef } from "react";
import type {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from "@hello-pangea/dnd";
import { Phone, Star, Calendar, Mail, MapPin, User } from "lucide-react";
import type { Lead, TeamMember } from "@/lib/crm";
import { getNextActionTone, nextActionToneStyles, teamMemberLabel } from "@/lib/crm";
import { DiscoveryProgress } from "./DiscoveryProgress";
import { StatusBadge } from "./StatusBadge";

interface Props {
  lead: Lead;
  onOpen: () => void;
  teamMembers?: TeamMember[];
  activityCount?: number;
  isDragging?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  draggableProps?: DraggableProvidedDraggableProps;
}

export const LeadCard = forwardRef<HTMLElement, Props>(function LeadCard(
  { lead, onOpen, teamMembers = [], activityCount, isDragging, dragHandleProps, draggableProps },
  ref,
) {
  const next = lead.next_action_at
    ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(
        new Date(lead.next_action_at),
      )
    : null;

  const assignedMember = lead.assigned_to
    ? teamMembers.find((m) => m.id === lead.assigned_to)
    : null;
  const assignedLabel = assignedMember ? teamMemberLabel(assignedMember) : lead.owner_name;

  const tone = getNextActionTone(lead.next_action_at);
  const hasActivity = (activityCount ?? 0) > 0;

  return (
    <article
      ref={ref}
      {...draggableProps}
      {...dragHandleProps}
      onClick={onOpen}
      className={`group relative bg-paper border border-line rounded-xl p-4 cursor-pointer hover:border-ink/30 hover:shadow-[0_6px_20px_-12px_rgba(14,17,22,0.18)] transition-all active:cursor-grabbing ${isDragging ? "shadow-lg rotate-1" : ""}`}
    >
      {activityCount !== undefined && (
        <span
          title={`${activityCount} actividad${activityCount === 1 ? "" : "es"} registrada${activityCount === 1 ? "" : "s"}`}
          className={`absolute -top-1.5 -right-1.5 flex items-center justify-center h-5 w-5 rounded-full font-mono text-[10px] font-bold border ${
            hasActivity
              ? "bg-crypto-green/10 border-crypto-green/40 text-crypto-green"
              : "bg-destructive/10 border-destructive/40 text-destructive"
          }`}
        >
          {activityCount}
        </span>
      )}

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

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <StatusBadge status={lead.status} size="sm" />
        <DiscoveryProgress discovery={lead.discovery} variant="pill" />
      </div>

      {lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {(lead.address || lead.phone || lead.email) && (
        <div className="mt-3 pt-3 border-t border-line space-y-2">
          {lead.address && (
            <p className="text-[12.5px] text-muted-foreground flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-none mt-0.5" />
              <span>{lead.address}</span>
            </p>
          )}
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
        {assignedLabel ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] uppercase text-faint truncate">
            <User className="h-3 w-3 flex-none" />
            {assignedLabel}
          </span>
        ) : <span />}
        {next && (
          <span
            className={`inline-flex items-center gap-1 font-mono text-[10.5px] rounded-full px-2 py-0.5 border ${nextActionToneStyles[tone]}`}
          >
            <Calendar className="h-3 w-3" />
            {next}
          </span>
        )}
      </div>
    </article>
  );
});
