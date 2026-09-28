import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/crm/useTeamMembers";
import {
  useCreateMovement,
  useDeleteMovement,
  useEurUsdRate,
  useFinanceMovements,
  useUpdateEurUsdRate,
  useUpdateMovement,
  type NewMovement,
} from "@/hooks/finance/useLedger";
import { teamMemberLabel } from "@/lib/crm";
import {
  buildLedger,
  summarizeByMember,
  type LedgerCurrency,
  type LedgerKind,
  type LedgerRow,
} from "@/lib/ledger";

const usd = new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" });
const money = (amount: number, currency: LedgerCurrency) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);

const thClass =
  "text-left font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground px-4 py-3 whitespace-nowrap";
const thRight = `${thClass} text-right`;
const tdClass = "px-4 py-3 whitespace-nowrap";
const numCell = `${tdClass} text-right font-mono text-[13px]`;
const labelClass = "block font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground mb-1.5";
const primaryBtn =
  "inline-flex items-center gap-2 bg-ink text-paper font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 hover:bg-ink-2 transition-colors disabled:opacity-60";

const todayIso = () => new Date().toISOString().slice(0, 10);

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-paper border border-line rounded-xl p-4">
      <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">{label}</p>
      <p
        className={`mt-2 text-[26px] font-bold tracking-tight ${tone ?? "text-ink"}`}
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {value}
      </p>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-paper border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

const balanceTone = (n: number) => (n < 0 ? "text-destructive" : "text-ink");

function RateCard() {
  const { toast } = useToast();
  const { data: rate } = useEurUsdRate();
  const update = useUpdateEurUsdRate();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (rate !== undefined) setDraft(String(rate));
  }, [rate]);

  const parsed = Number(draft.replace(",", "."));
  const valid = Number.isFinite(parsed) && parsed > 0;
  const dirty = valid && parsed !== rate;

  const save = () =>
    update.mutate(parsed, {
      onSuccess: () => toast({ title: "Tipo de cambio actualizado" }),
      onError: (err) =>
        toast({
          title: "No se pudo guardar",
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        }),
    });

  return (
    <div className="bg-paper border border-line rounded-xl p-4 flex flex-col gap-2">
      <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">
        Tipo de cambio EUR → USD
      </p>
      <div className="flex items-center gap-2">
        <input
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="form-input font-mono text-[15px] w-28"
          aria-label="Tipo de cambio EUR a USD"
        />
        <button
          onClick={save}
          disabled={!dirty || update.isPending}
          className="font-mono text-[11px] tracking-[0.08em] uppercase rounded-full px-3 py-2 border border-line text-ink hover:border-ink/30 disabled:opacity-40"
        >
          {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Guardar"}
        </button>
      </div>
      <p className="text-[12px] text-muted-foreground">Se aplica a todos los movimientos en EUR.</p>
    </div>
  );
}

const emptyForm = (): NewMovement => ({
  occurred_on: todayIso(),
  member_id: null,
  kind: "ingreso",
  description: "",
  currency: "USD",
  amount: 0,
});

function MovementDialog({
  open,
  onOpenChange,
  editing,
  defaultMemberId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: LedgerRow | null;
  defaultMemberId: string | null;
}) {
  const { toast } = useToast();
  const { data: team = [] } = useTeamMembers();
  const create = useCreateMovement();
  const update = useUpdateMovement();
  const [form, setForm] = useState<NewMovement>(emptyForm);
  const [amountDraft, setAmountDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    const base = editing
      ? {
          occurred_on: editing.occurred_on,
          member_id: editing.member_id,
          kind: editing.kind,
          description: editing.description,
          currency: editing.currency,
          amount: editing.amount,
        }
      : { ...emptyForm(), member_id: defaultMemberId };
    setForm(base);
    setAmountDraft(editing ? String(editing.amount) : "");
  }, [open, editing, defaultMemberId]);

  const set = <K extends keyof NewMovement>(key: K, value: NewMovement[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const amount = Number(amountDraft.replace(",", "."));
  const valid = Number.isFinite(amount) && amount > 0 && Boolean(form.occurred_on);
  const pending = create.isPending || update.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const payload = { ...form, description: form.description.trim(), amount: Math.round(amount * 100) / 100 };
    const callbacks = {
      onSuccess: () => {
        toast({ title: editing ? "Movimiento actualizado" : "Movimiento añadido" });
        onOpenChange(false);
      },
      onError: (err: unknown) =>
        toast({
          title: "No se pudo guardar",
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        }),
    };
    if (editing) update.mutate({ id: editing.id, patch: payload }, callbacks);
    else create.mutate(payload, callbacks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-[16px]">
            {editing ? "Editar movimiento" : "Nuevo movimiento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={labelClass}>Fecha</span>
            <input
              type="date"
              required
              value={form.occurred_on}
              onChange={(e) => set("occurred_on", e.target.value)}
              className="form-input"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Miembro</span>
            <select
              value={form.member_id ?? ""}
              onChange={(e) => set("member_id", e.target.value || null)}
              className="form-input"
            >
              <option value="">Sin asignar</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {teamMemberLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Tipo</span>
            <select
              value={form.kind}
              onChange={(e) => set("kind", e.target.value as LedgerKind)}
              className="form-input"
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Moneda</span>
            <select
              value={form.currency}
              onChange={(e) => set("currency", e.target.value as LedgerCurrency)}
              className="form-input"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label className="block col-span-2">
            <span className={labelClass}>Descripción</span>
            <input
              value={form.description}
              maxLength={500}
              onChange={(e) => set("description", e.target.value)}
              className="form-input"
              placeholder="Dominio, pago proveedor…"
            />
          </label>
          <label className="block col-span-2">
            <span className={labelClass}>Monto ({form.currency})</span>
            <input
              inputMode="decimal"
              required
              value={amountDraft}
              onChange={(e) => setAmountDraft(e.target.value)}
              className="form-input font-mono text-[15px]"
              placeholder="0.00"
            />
          </label>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="font-mono text-[12px] tracking-[0.08em] uppercase rounded-full px-4 py-2.5 border border-line text-ink hover:border-ink/30"
            >
              Cancelar
            </button>
            <button type="submit" disabled={!valid || pending} className={primaryBtn}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Guardar" : "Añadir"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Réplica de la hoja "VENDING MACHINE PROJECT — Ledger": Config, Movimientos y Resumen. */
export function LedgerPanel({ currentUserId }: { currentUserId: string | null }) {
  const { toast } = useToast();
  const { data: movements = [], isLoading } = useFinanceMovements();
  const { data: rate } = useEurUsdRate();
  const { data: team = [] } = useTeamMembers();
  const remove = useDeleteMovement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LedgerRow | null>(null);
  const [deleting, setDeleting] = useState<LedgerRow | null>(null);

  const eurUsdRate = rate ?? 1;
  const ledger = useMemo(() => buildLedger(movements, eurUsdRate), [movements, eurUsdRate]);
  const summary = useMemo(
    () => summarizeByMember(movements, eurUsdRate, team.map((m) => m.id)),
    [movements, eurUsdRate, team],
  );

  const memberName = (id: string | null) => {
    const member = team.find((m) => m.id === id);
    return member ? teamMemberLabel(member) : "Sin asignar";
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => toast({ title: "Movimiento eliminado" }),
      onError: (err) =>
        toast({
          title: "No se pudo eliminar",
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        }),
      onSettled: () => setDeleting(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Ingresos (USD)" value={usd.format(ledger.totals.incomeUsd)} tone="text-crypto-green" />
        <MetricCard label="Egresos (USD)" value={usd.format(ledger.totals.expenseUsd)} />
        <MetricCard
          label="Balance (USD)"
          value={usd.format(ledger.totals.balanceUsd)}
          tone={balanceTone(ledger.totals.balanceUsd)}
        />
        <RateCard />
      </div>

      <Card
        title="Movimientos"
        action={
          <button onClick={openNew} className={primaryBtn}>
            <Plus className="h-4 w-4" /> Añadir movimiento
          </button>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ledger.rows.length === 0 ? (
          <p className="px-5 pb-6 text-[14px] text-muted-foreground">
            Sin movimientos todavía. Añade el primero para empezar el ledger.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-[14px]">
              <thead>
                <tr className="border-y border-line bg-panel/50">
                  <th className={thClass}>Fecha</th>
                  <th className={thClass}>Miembro</th>
                  <th className={thClass}>Tipo</th>
                  <th className={thClass}>Descripción</th>
                  <th className={thClass}>Moneda</th>
                  <th className={thRight}>Ingreso</th>
                  <th className={thRight}>Egreso</th>
                  <th className={thRight}>Balance (USD)</th>
                  <th className={thClass}>
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledger.rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/70 hover:bg-panel/60">
                    <td className={`${tdClass} font-mono text-[13px]`}>{formatDate(r.occurred_on)}</td>
                    <td className={tdClass}>{memberName(r.member_id)}</td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex font-mono text-[10.5px] tracking-[0.08em] uppercase rounded-full px-2.5 py-1 ${
                          r.kind === "ingreso"
                            ? "bg-crypto-green/10 text-crypto-green"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {r.kind === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                    </td>
                    <td className={`${tdClass} max-w-[280px] truncate`} title={r.description}>
                      {r.description || "—"}
                    </td>
                    <td className={`${tdClass} font-mono text-[13px]`}>{r.currency}</td>
                    <td className={numCell}>{r.kind === "ingreso" ? money(r.amount, r.currency) : ""}</td>
                    <td className={numCell}>{r.kind === "egreso" ? money(r.amount, r.currency) : ""}</td>
                    <td className={`${numCell} font-semibold ${balanceTone(r.balanceUsd)}`}>
                      {usd.format(r.balanceUsd)}
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => {
                            setEditing(r);
                            setDialogOpen(true);
                          }}
                          title="Editar"
                          className="h-8 w-8 rounded-md text-muted-foreground hover:text-ink hover:bg-panel flex items-center justify-center"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(r)}
                          title="Eliminar"
                          className="h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-panel flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-panel/50 font-semibold">
                  <td className={`${tdClass} font-mono text-[11px] uppercase tracking-[0.12em]`} colSpan={5}>
                    Totales (USD)
                  </td>
                  <td className={numCell}>{usd.format(ledger.totals.incomeUsd)}</td>
                  <td className={numCell}>{usd.format(ledger.totals.expenseUsd)}</td>
                  <td className={`${numCell} ${balanceTone(ledger.totals.balanceUsd)}`}>
                    {usd.format(ledger.totals.balanceUsd)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <Card title="Resumen por miembro">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[14px]">
            <thead>
              <tr className="border-y border-line bg-panel/50">
                <th className={thClass}>Miembro</th>
                <th className={thRight}>Total ingresos</th>
                <th className={thRight}>Total egresos</th>
                <th className={thRight}>Balance (USD)</th>
                <th className={thRight}>% Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {summary.members.map((m) => (
                <tr key={m.memberId ?? "none"} className="border-b border-line/70">
                  <td className={`${tdClass} text-ink font-medium`}>{memberName(m.memberId)}</td>
                  <td className={numCell}>{usd.format(m.incomeUsd)}</td>
                  <td className={numCell}>{usd.format(m.expenseUsd)}</td>
                  <td className={`${numCell} ${balanceTone(m.balanceUsd)}`}>{usd.format(m.balanceUsd)}</td>
                  <td className={numCell}>{m.incomeShare.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-panel/50 font-semibold">
                <td className={`${tdClass} font-mono text-[11px] uppercase tracking-[0.12em]`}>Total</td>
                <td className={numCell}>{usd.format(summary.total.incomeUsd)}</td>
                <td className={numCell}>{usd.format(summary.total.expenseUsd)}</td>
                <td className={`${numCell} ${balanceTone(summary.total.balanceUsd)}`}>
                  {usd.format(summary.total.balanceUsd)}
                </td>
                <td className={numCell}>{summary.total.incomeShare.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <MovementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        defaultMemberId={currentUserId}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting &&
                `${formatDate(deleting.occurred_on)} · ${deleting.description || "Sin descripción"} · ${money(
                  deleting.amount,
                  deleting.currency,
                )}. No se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
