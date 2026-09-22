import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LEAD_CATEGORIES, LEAD_STATUSES, type Lead, teamMemberLabel } from "@/lib/crm";
import { useCreateLead, useUpdateLead, type NewLead } from "@/hooks/crm/useLeads";
import { useTeamMembers } from "@/hooks/crm/useTeamMembers";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead | null;
}

const empty: NewLead = {
  name: "",
  category: "Gimnasios",
  address: null,
  phone: null,
  email: null,
  website: null,
  rating: null,
  status: "Nuevo",
  owner_name: null,
  assigned_to: null,
  tags: [],
  next_action_at: null,
  next_action_note: null,
  notes: null,
  discovery: {},
};


export function LeadForm({ open, onOpenChange, lead }: Props) {
  const [form, setForm] = useState<NewLead>(empty);
  const [tagsInput, setTagsInput] = useState("");
  const create = useCreateLead();
  const update = useUpdateLead();
  const { data: teamMembers = [] } = useTeamMembers();
  const { toast } = useToast();

  useEffect(() => {
    if (lead) {
      const { id: _id, user_id: _u, created_at: _c, updated_at: _up, ...rest } = lead;
      setForm(rest as NewLead);
      setTagsInput((lead.tags ?? []).join(", "));
    } else {
      setForm(empty);
      setTagsInput("");
    }
  }, [lead, open]);

  const set = <K extends keyof NewLead>(k: K, v: NewLead[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload: NewLead = { ...form, tags };
    try {
      if (lead) {
        await update.mutateAsync({ id: lead.id, patch: payload });
        toast({ title: "Lead actualizado" });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "Lead creado" });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Inténtalo de nuevo",
        variant: "destructive",
      });
    }
  };

  const loading = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-[16px] tracking-tight">
            {lead ? "Editar lead" : "Nuevo lead"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Nombre *
              </span>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Categoría
              </span>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="form-input"
              >
                {LEAD_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Estado
              </span>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="form-input"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Dirección
              </span>
              <input
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value || null)}
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Teléfono
              </span>
              <input
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value || null)}
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Email
              </span>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value || null)}
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Web
              </span>
              <input
                value={form.website ?? ""}
                onChange={(e) => set("website", e.target.value || null)}
                className="form-input"
                placeholder="https://"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Rating (0–5)
              </span>
              <input
                type="number"
                step={0.1}
                min={0}
                max={5}
                value={form.rating ?? ""}
                onChange={(e) =>
                  set("rating", e.target.value === "" ? null : parseFloat(e.target.value))
                }
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Asignado a
              </span>
              <select
                value={form.assigned_to ?? ""}
                onChange={(e) => set("assigned_to", e.target.value || null)}
                className="form-input"
              >
                <option value="">Sin asignar</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {teamMemberLabel(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Tags (separados por coma)
              </span>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="prioridad, revisitar…"
                className="form-input"
              />
            </label>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="font-mono text-[12px] tracking-[0.06em] uppercase text-muted-foreground hover:text-ink px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-5 py-2.5 hover:bg-ink-2 disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {lead ? "Guardar cambios" : "Crear lead"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
