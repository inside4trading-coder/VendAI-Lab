import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MACHINE_STATUSES, type Machine } from "@/lib/machines";
import { useCreateMachine, useUpdateMachine, useMachines, type NewMachine } from "@/hooks/machines/useMachines";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LocationPicker } from "./LocationPicker";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  machine?: Machine | null;
  defaultLeadId?: string | null;
}

const empty: NewMachine = {
  code: "",
  name: "",
  model: null,
  status: "Activa",
  lead_id: null,
  location_label: null,
  slots_total: 30,
  installed_at: null,
  last_service_at: null,
  notes: null,
};

export function MachineForm({ open, onOpenChange, machine, defaultLeadId }: Props) {
  const { data: machines = [] } = useMachines();
  const [form, setForm] = useState<NewMachine>(empty);
  const create = useCreateMachine();
  const update = useUpdateMachine();
  const { toast } = useToast();

  useEffect(() => {
    if (machine) {
      const { id: _id, user_id: _u, created_at: _c, updated_at: _up, ...rest } = machine;
      setForm(rest as NewMachine);
    } else {
      const nextNum = machines.length + 1;
      const code = `VND-${String(nextNum).padStart(3, "0")}`;
      setForm({ ...empty, code, lead_id: defaultLeadId ?? null });
    }
  }, [machine, open, defaultLeadId, machines.length]);

  const set = <K extends keyof NewMachine>(k: K, v: NewMachine[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (machine) {
        await update.mutateAsync({ id: machine.id, patch: form });
        toast({ title: "Máquina actualizada" });
      } else {
        await create.mutateAsync(form);
        toast({ title: "Máquina creada" });
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-[16px] tracking-tight">
            {machine ? "Editar máquina" : "Nueva máquina"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Código *
              </span>
              <input
                required
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                className="form-input"
              />
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
                {MACHINE_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
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
            <label className="block sm:col-span-2">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Modelo
              </span>
              <input
                value={form.model ?? ""}
                onChange={(e) => set("model", e.target.value || null)}
                className="form-input"
                placeholder="Azkoyen Palma+ H70"
              />
            </label>

            <div className="sm:col-span-2">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Ubicación
              </span>
              <LocationPicker
                leadId={form.lead_id}
                locationLabel={form.location_label}
                onChange={(p) =>
                  setForm((prev) => ({
                    ...prev,
                    lead_id: p.leadId,
                    location_label: p.locationLabel,
                  }))
                }
              />
            </div>

            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Slots totales
              </span>
              <input
                type="number"
                min={0}
                value={form.slots_total}
                onChange={(e) => set("slots_total", parseInt(e.target.value || "0", 10))}
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Instalación
              </span>
              <input
                type="date"
                value={form.installed_at ?? ""}
                onChange={(e) => set("installed_at", e.target.value || null)}
                className="form-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="block font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
                Notas
              </span>
              <textarea
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value || null)}
                rows={3}
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
              {machine ? "Guardar cambios" : "Crear máquina"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
