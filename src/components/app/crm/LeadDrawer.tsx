import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Lead, type LeadDiscovery, DISCOVERY_QUESTIONS } from "@/lib/crm";
import { StatusSelect } from "./StatusSelect";
import { DiscoveryProgress } from "./DiscoveryProgress";
import { useUpdateLead, useDeleteLead } from "@/hooks/crm/useLeads";
import { useLeadActivities, useCreateActivity } from "@/hooks/crm/useLeadActivities";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  Calendar,
  Trash2,
  MessageSquare,
  PhoneCall,
  Users,
  StickyNote,
  RefreshCw,
  Pencil,
  Cpu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";


interface Props {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: (lead: Lead) => void;
}

const activityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  llamada: PhoneCall,
  email: Mail,
  reunion: Users,
  nota: StickyNote,
  cambio_estado: RefreshCw,
};

const activityLabel: Record<string, string> = {
  llamada: "Llamada",
  email: "Email",
  reunion: "Reunión",
  nota: "Nota",
  cambio_estado: "Cambio de estado",
};

function relativeDate(d: string) {
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const day = Math.round(h / 24);
  if (day < 7) return `hace ${day} d`;
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(date);
}

export function LeadDrawer({ lead, open, onOpenChange, onEdit }: Props) {
  const update = useUpdateLead();
  const del = useDeleteLead();
  const { data: activities = [] } = useLeadActivities(lead?.id ?? null);
  const createActivity = useCreateActivity();
  const { toast } = useToast();

  const [notesDraft, setNotesDraft] = useState("");
  const [actType, setActType] = useState("nota");
  const [actTitle, setActTitle] = useState("");
  const [actBody, setActBody] = useState("");
  const [nextAt, setNextAt] = useState("");
  const [nextNote, setNextNote] = useState("");
  const [discoveryDraft, setDiscoveryDraft] = useState<LeadDiscovery>({});

  useEffect(() => {
    if (!lead) return;
    setNotesDraft(lead.notes ?? "");
    setNextAt(lead.next_action_at ? lead.next_action_at.slice(0, 16) : "");
    setNextNote(lead.next_action_note ?? "");
    setDiscoveryDraft(lead.discovery ?? {});
  }, [lead]);

  if (!lead) return null;

  const handleStatus = async (status: string) => {
    if (status === lead.status) return;
    const prev = lead.status;
    await update.mutateAsync({ id: lead.id, patch: { status } });
    createActivity.mutate({
      lead_id: lead.id,
      type: "cambio_estado",
      title: `Estado cambiado a "${status}"`,
      body: `Antes: ${prev}`,
    });
  };

  const saveNotes = async () => {
    if (notesDraft === (lead.notes ?? "")) return;
    await update.mutateAsync({ id: lead.id, patch: { notes: notesDraft || null } });
    toast({ title: "Notas guardadas" });
  };

  const saveNextAction = async () => {
    await update.mutateAsync({
      id: lead.id,
      patch: {
        next_action_at: nextAt ? new Date(nextAt).toISOString() : null,
        next_action_note: nextNote || null,
      },
    });
    toast({ title: "Próxima acción actualizada" });
  };

  const saveDiscovery = async (next: LeadDiscovery) => {
    setDiscoveryDraft(next);
    await update.mutateAsync({ id: lead.id, patch: { discovery: next } });
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle && !actBody) return;
    await createActivity.mutateAsync({
      lead_id: lead.id,
      type: actType,
      title: actTitle || null,
      body: actBody || null,
    });
    setActTitle("");
    setActBody("");
    toast({ title: "Actividad registrada" });
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${lead.name}"? Esta acción no se puede deshacer.`)) return;
    await del.mutateAsync(lead.id);
    toast({ title: "Lead eliminado" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[560px] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-line">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="eyebrow text-[10px]">{lead.category}</span>
              <SheetTitle className="mt-2 text-[20px] font-mono leading-tight">
                {lead.name}
              </SheetTitle>
              {lead.owner_name && (
                <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                  Responsable: {lead.owner_name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(lead)}
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-ink hover:bg-panel flex items-center justify-center"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <StatusSelect value={lead.status} onChange={handleStatus} />
            <DiscoveryProgress discovery={discoveryDraft} />
            {lead.rating && lead.rating > 0 && (
              <span className="inline-flex items-center gap-1 font-mono text-[12px] text-ink-2">
                <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" strokeWidth={0} />
                {Number(lead.rating).toFixed(1)}
              </span>
            )}
          </div>
          {lead.status === "Ganado" && (
            <Link
              to={`/app/maquinas?newWithLead=${lead.id}`}
              onClick={() => onOpenChange(false)}
              className="mt-3 inline-flex items-center gap-1.5 self-start bg-crypto-green/10 hover:bg-crypto-green/20 border border-crypto-green/30 text-crypto-green font-mono text-[11px] tracking-[0.08em] uppercase rounded-full px-3 py-1.5 transition-colors"
            >
              <Cpu className="h-3.5 w-3.5" /> Crear máquina aquí
            </Link>
          )}
        </SheetHeader>


        {/* Contacto */}
        <div className="px-6 py-5 border-b border-line space-y-2.5">
          {lead.phone && (
            <a
              href={`tel:${lead.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 text-[14px] text-ink hover:text-signal-blue"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              {lead.phone}
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-3 text-[14px] text-ink hover:text-signal-blue break-all"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {lead.email}
            </a>
          )}
          {lead.address && (
            <div className="flex items-start gap-3 text-[14px] text-ink-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-none" />
              {lead.address}
            </div>
          )}
          {lead.website && (
            <a
              href={lead.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-[14px] text-ink hover:text-signal-blue break-all"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              {lead.website}
            </a>
          )}
        </div>

        {/* Próxima acción */}
        <div className="px-6 py-5 border-b border-line">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-signal-blue" />
            <h3 className="font-mono text-[12px] tracking-[0.1em] uppercase text-ink">
              Próxima acción
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <input
              type="datetime-local"
              value={nextAt}
              onChange={(e) => setNextAt(e.target.value)}
              className="form-input"
            />
            <input
              value={nextNote}
              onChange={(e) => setNextNote(e.target.value)}
              placeholder="Nota / objetivo de la acción"
              className="form-input"
            />
            <button
              onClick={saveNextAction}
              className="self-end font-mono text-[11px] tracking-[0.08em] uppercase text-signal-blue hover:underline"
            >
              Guardar acción →
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-5">
          <Tabs defaultValue="actividades">
            <TabsList className="bg-panel">
              <TabsTrigger value="actividades" className="font-mono text-[11px] tracking-[0.06em] uppercase">
                Actividades
              </TabsTrigger>
              <TabsTrigger value="discovery" className="font-mono text-[11px] tracking-[0.06em] uppercase">
                Discovery
              </TabsTrigger>
              <TabsTrigger value="notas" className="font-mono text-[11px] tracking-[0.06em] uppercase">
                Notas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discovery" className="mt-4 space-y-4">
              <p className="text-[12px] text-muted-foreground">
                5 preguntas del guion de llamada. Se guardan al salir del campo.
              </p>
              {DISCOVERY_QUESTIONS.map((q) => (
                <div key={q.key} className="space-y-1.5">
                  <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground">
                    {q.label}
                  </p>
                  <p className="text-[13px] text-ink-2 leading-snug">{q.question}</p>
                  <textarea
                    value={discoveryDraft[q.key] ?? ""}
                    onChange={(e) =>
                      setDiscoveryDraft({ ...discoveryDraft, [q.key]: e.target.value })
                    }
                    onBlur={() => {
                      const cur = (lead.discovery ?? {})[q.key] ?? "";
                      const next = discoveryDraft[q.key] ?? "";
                      if (cur !== next) {
                        saveDiscovery({
                          ...discoveryDraft,
                          [q.key]: next || null,
                        });
                      }
                    }}
                    rows={2}
                    placeholder="Respuesta del prospecto…"
                    className="form-input resize-none text-[13px]"
                  />
                </div>
              ))}
            </TabsContent>


            <TabsContent value="actividades" className="mt-4 space-y-5">
              <form
                onSubmit={addActivity}
                className="bg-panel border border-line rounded-xl p-3 space-y-2.5"
              >
                <div className="flex gap-2">
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                    className="form-input flex-none w-44"
                  >
                    <option value="nota">Nota</option>
                    <option value="llamada">Llamada</option>
                    <option value="email">Email</option>
                    <option value="reunion">Reunión</option>
                  </select>
                  <input
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    placeholder="Título"
                    className="form-input flex-1"
                  />
                </div>
                <textarea
                  value={actBody}
                  onChange={(e) => setActBody(e.target.value)}
                  placeholder="Detalles…"
                  rows={2}
                  className="form-input resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={createActivity.isPending || (!actTitle && !actBody)}
                    className="bg-ink text-paper font-mono text-[11px] tracking-[0.08em] uppercase rounded-full px-4 py-2 hover:bg-ink-2 disabled:opacity-50 transition-colors"
                  >
                    Registrar
                  </button>
                </div>
              </form>

              <ul className="space-y-3">
                {activities.length === 0 && (
                  <li className="text-center font-mono text-[11px] tracking-[0.08em] uppercase text-faint py-6">
                    Sin actividades registradas
                  </li>
                )}
                {activities.map((a) => {
                  const Icon = activityIcon[a.type] ?? MessageSquare;
                  return (
                    <li key={a.id} className="flex gap-3">
                      <div className="h-7 w-7 rounded-full bg-panel border border-line flex items-center justify-center flex-none">
                        <Icon className="h-3.5 w-3.5 text-ink-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[13.5px] text-ink font-medium">
                            {a.title ?? activityLabel[a.type] ?? a.type}
                          </p>
                          <span className="font-mono text-[10.5px] text-muted-foreground flex-none">
                            {relativeDate(a.occurred_at)}
                          </span>
                        </div>
                        {a.body && (
                          <p className="mt-0.5 text-[13px] text-muted-foreground whitespace-pre-wrap">
                            {a.body}
                          </p>
                        )}
                        <p className="mt-0.5 font-mono text-[10px] tracking-[0.06em] uppercase text-faint">
                          {activityLabel[a.type] ?? a.type}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </TabsContent>

            <TabsContent value="notas" className="mt-4">
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={saveNotes}
                rows={10}
                placeholder="Notas internas sobre este lead…"
                className="form-input resize-none"
              />
              <p className="mt-2 font-mono text-[10.5px] tracking-[0.08em] uppercase text-faint">
                Se guarda automáticamente al salir del campo
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
