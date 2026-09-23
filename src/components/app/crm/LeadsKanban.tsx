import { useRef } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lead, TeamMember } from "@/lib/crm";
import { LEAD_STATUSES, statusStyles } from "@/lib/crm";
import { LeadCard } from "./LeadCard";
import { useUpdateLead } from "@/hooks/crm/useLeads";
import { useCreateActivity } from "@/hooks/crm/useLeadActivities";

interface Props {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
  teamMembers: TeamMember[];
  activityCounts: Record<string, number>;
}

export function LeadsKanban({ leads, onOpen, teamMembers, activityCounts }: Props) {
  const update = useUpdateLead();
  const createActivity = useCreateActivity();
  const boardRef = useRef<HTMLDivElement>(null);
  const isDraggingScroll = useRef(false);
  const isCardDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!boardRef.current || isCardDragging.current) return;
    // Un drag-handle de @hello-pangea/dnd no debe iniciar el scroll manual.
    if ((e.target as HTMLElement).closest('[data-rbd-drag-handle-draggable-id]')) return;
    isDraggingScroll.current = true;
    startX.current = e.pageX - boardRef.current.offsetLeft;
    scrollLeftStart.current = boardRef.current.scrollLeft;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll.current || !boardRef.current || isCardDragging.current) return;
    const x = e.pageX - boardRef.current.offsetLeft;
    boardRef.current.scrollLeft = scrollLeftStart.current - (x - startX.current);
  };
  const handleMouseUp = () => {
    isDraggingScroll.current = false;
  };

  const onDragStart = () => {
    isCardDragging.current = true;
  };

  const onDragEnd = async (result: DropResult) => {
    isCardDragging.current = false;
    if (!result.destination) return;
    const status = result.destination.droppableId;
    const id = result.draggableId;
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
    <div className="relative group/kanban">
      <button
        type="button"
        onClick={() => boardRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-paper border border-line shadow-sm flex items-center justify-center text-muted-foreground hover:text-ink hover:shadow-md transition-all opacity-0 group-hover/kanban:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => boardRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-paper border border-line shadow-sm flex items-center justify-center text-muted-foreground hover:text-ink hover:shadow-md transition-all opacity-0 group-hover/kanban:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div
          ref={boardRef}
          className="flex lg:grid gap-5 min-w-max lg:min-w-0 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
          style={{ gridTemplateColumns: `repeat(${LEAD_STATUSES.length}, minmax(0, 1fr))` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {LEAD_STATUSES.map((status) => {
            const items = leads.filter((l) => l.status === status);
            const st = statusStyles[status];
            return (
              <div
                key={status}
                className={`w-[280px] lg:w-auto flex-none lg:flex-1 min-w-0 bg-panel border border-line border-t-[3px] ${st.col} rounded-xl flex flex-col`}
              >
                <header className="px-4 py-3 flex items-center justify-between border-b border-line/70">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot} flex-none`} />
                    <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-ink truncate">
                      {status}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {items.length}
                  </span>
                </header>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 space-y-3 min-h-[80px] transition-colors ${snapshot.isDraggingOver ? "bg-line/40" : ""}`}
                    >
                      {items.map((lead, i) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={i}>
                          {(prov, snap) => (
                            <LeadCard
                              ref={prov.innerRef}
                              draggableProps={prov.draggableProps}
                              dragHandleProps={prov.dragHandleProps}
                              isDragging={snap.isDragging}
                              lead={lead}
                              onOpen={() => onOpen(lead)}
                              teamMembers={teamMembers}
                              activityCount={activityCounts[lead.id] ?? 0}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {items.length === 0 && (
                        <div className="text-center font-mono text-[10.5px] tracking-[0.1em] uppercase text-faint py-6">
                          Vacío
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
