import { forwardRef } from "react";
import type {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from "@hello-pangea/dnd";
import { Star, Calendar } from "lucide-react";
import type { Lead, TeamMember } from "@/lib/crm";
import { getNextActionTone, nextActionToneStyles, teamMemberLabel } from "@/lib/crm";
import { DiscoveryProgress } from "./DiscoveryProgress";

interface Props {
  lead: Lead;
  onOpen: () => void;
  teamMembers?: TeamMember[];
  activityCount?: number;
  isDragging?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  draggableProps?: DraggableProvidedDraggableProps;
}

const MAX_TAGS = 1;

function initials(label: string): string {
  const base = label.includes("@") ? label.split("@")[0] : label;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Tarjeta compacta del Kanban: lo justo para decidir a quién llamar.
 * Dirección, email, estado y notas viven en el drawer (clic en la tarjeta);
 * el estado ya lo da la columna.
 */
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
  const noActivity = activityCount !== undefined && activityCount === 0;
  const extraTags = Math.max(0, lead.tags.length - MAX_TAGS);

  return (
    <article
      ref={ref}
      {...draggableProps}
      {...dragHandleProps}
      onClick={onOpen}
      className={`group relative bg-paper border border-line rounded-xl px-3 py-2.5 cursor-pointer hover:border-ink/30 hover:shadow-[0_6px_20px_-12px_rgba(14,17,22,0.18)] transition-all active:cursor-grabbing ${isDragging ? "shadow-lg rotate-1" : ""} ${noActivity ? "border-l-[3px] border-l-destructive/60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13.5px] font-medium text-ink leading-snug line-clamp-2 min-w-0">
          {lead.name}
        </h4>
        {lead.rating && lead.rating > 0 ? (
          <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] text-ink-2 flex-none mt-0.5">
            <Star className="h-3 w-3 text-amber-400" fill="currentColor" strokeWidth={0} />
            {Number(lead.rating).toFixed(1)}
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex items-center gap-1.5 font-mono text-[10.5px] text-muted-foreground min-w-0">
        <span className="uppercase tracking-[0.06em] flex-none">{lead.category}</span>
        {lead.phone && (
          <>
            <span className="text-faint">·</span>
            <a
              href={`tel:${lead.phone.replace(/\s/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate hover:text-signal-blue"
            >
              {lead.phone}
            </a>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {next && (
            <span
              title="Próxima acción"
              className={`inline-flex items-center gap-1 font-mono text-[10px] rounded-full px-1.5 py-px border ${nextActionToneStyles[tone]}`}
            >
              <Calendar className="h-2.5 w-2.5" />
              {next}
            </span>
          )}
          <DiscoveryProgress discovery={lead.discovery} variant="dots" />
          {lead.tags.slice(0, MAX_TAGS).map((t) => (
            <span
              key={t}
              className="font-mono text-[9.5px] uppercase tracking-[0.04em] text-muted-foreground bg-panel rounded px-1 py-px truncate max-w-[120px]"
            >
              {t}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="font-mono text-[9.5px] text-faint">+{extraTags}</span>
          )}
        </div>

        {assignedLabel && (
          <span
            title={assignedLabel}
            className="flex-none inline-flex items-center justify-center h-5 w-5 rounded-full bg-ink text-paper font-mono text-[9px] font-semibold"
          >
            {initials(assignedLabel)}
          </span>
        )}
      </div>
    </article>
  );
});
