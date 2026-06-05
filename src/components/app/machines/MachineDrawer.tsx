import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type Machine,
  type MachineProduct,
  SERVICE_TYPES,
  SERVICE_LABELS,
  computeStockPercent,
  computeSalesToday,
  formatDate,
} from "@/lib/machines";
import { useLeads } from "@/hooks/crm/useLeads";
import { useUpdateMachine, useDeleteMachine } from "@/hooks/machines/useMachines";
import {
  useMachineProducts,
  useUpsertMachineProduct,
  useDeleteMachineProduct,
} from "@/hooks/machines/useMachineProducts";
import {
  useMachineSales,
  useCreateMachineSale,
  useDeleteMachineSale,
} from "@/hooks/machines/useMachineSales";
import {
  useMachineServices,
  useCreateMachineService,
} from "@/hooks/machines/useMachineServices";
import { MachineStatusBadge } from "./MachineStatusBadge";
import { MapPin, Pencil, Trash2, Plus, Wrench, ShoppingCart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: (m: Machine) => void;
}

export function MachineDrawer({ machine, open, onOpenChange, onEdit }: Props) {
  const { data: leads = [] } = useLeads();
  const update = useUpdateMachine();
  const del = useDeleteMachine();
  const { toast } = useToast();
  const lead = machine?.lead_id ? leads.find((l) => l.id === machine.lead_id) : null;

  if (!machine) return null;

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar máquina ${machine.code}?`)) return;
    await del.mutateAsync(machine.id);
    toast({ title: "Máquina eliminada" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[640px] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-line">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="eyebrow text-[10px]">{machine.code}</span>
              <SheetTitle className="mt-2 text-[20px] font-mono leading-tight">
                {machine.name}
              </SheetTitle>
              {machine.model && (
                <p className="mt-1 text-[13px] text-muted-foreground">{machine.model}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(machine)}
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
            <select
              value={machine.status}
              onChange={(e) =>
                update.mutate({ id: machine.id, patch: { status: e.target.value } })
              }
              className="font-mono text-[11px] tracking-[0.04em] px-2.5 py-1 rounded-full border border-line bg-paper text-ink cursor-pointer"
            >
              {["Activa", "Mantenimiento", "Inactiva"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <MachineStatusBadge status={machine.status} />
          </div>
          {(lead || machine.location_label) && (
            <div className="mt-3 flex items-center gap-2 text-[13px] text-ink-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {lead?.name ?? machine.location_label}
              {lead?.address && (
                <span className="text-muted-foreground">· {lead.address}</span>
              )}
            </div>
          )}
        </SheetHeader>

        <Tabs defaultValue="resumen" className="px-6 py-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4">
            <ResumenTab machine={machine} />
          </TabsContent>
          <TabsContent value="inventario" className="mt-4">
            <InventarioTab machine={machine} />
          </TabsContent>
          <TabsContent value="ventas" className="mt-4">
            <VentasTab machine={machine} />
          </TabsContent>
          <TabsContent value="servicios" className="mt-4">
            <ServiciosTab machine={machine} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ---------- Resumen ----------
function ResumenTab({ machine }: { machine: Machine }) {
  const { data: products = [] } = useMachineProducts(machine.id);
  const { data: sales = [] } = useMachineSales(machine.id);
  const stockPct = computeStockPercent(products);
  const salesToday = computeSalesToday(sales);
  const lowStock = products.filter((p) => p.stock_capacity > 0 && p.stock / p.stock_capacity < 0.3);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Stock" value={`${stockPct}%`} />
        <Stat label="Ventas hoy" value={salesToday} />
        <Stat label="Slots" value={products.length} />
      </div>
      <div className="bg-panel border border-line rounded-xl p-4 space-y-1.5 text-[13px]">
        <Row label="Instalación" value={formatDate(machine.installed_at)} />
        <Row label="Último servicio" value={formatDate(machine.last_service_at)} />
        <Row label="Slots totales" value={machine.slots_total} />
      </div>
      {lowStock.length > 0 && (
        <div className="bg-destructive/8 border border-destructive/30 rounded-xl p-4">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-destructive">
            {lowStock.length} slot{lowStock.length === 1 ? "" : "s"} bajo en stock
          </p>
          <ul className="mt-2 space-y-0.5 text-[13px] text-ink-2">
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id}>
                <span className="font-mono text-[11px] text-faint">{p.slot_code}</span>{" "}
                {p.product_name} — {p.stock}/{p.stock_capacity}
              </li>
            ))}
          </ul>
        </div>
      )}
      {machine.notes && (
        <div className="bg-paper border border-line rounded-xl p-4 text-[13.5px] text-ink-2 whitespace-pre-wrap">
          {machine.notes}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-paper border border-line rounded-xl p-3">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
        {label}
      </p>
      <p
        className="mt-1 text-[22px] font-bold tracking-tight text-ink"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

// ---------- Inventario ----------
function InventarioTab({ machine }: { machine: Machine }) {
  const { data: products = [] } = useMachineProducts(machine.id);
  const upsert = useUpsertMachineProduct(machine.id);
  const del = useDeleteMachineProduct(machine.id);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    slot_code: "",
    product_name: "",
    price: 1.5,
    stock: 10,
    stock_capacity: 10,
  });

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync(draft);
    setDraft({ slot_code: "", product_name: "", price: 1.5, stock: 10, stock_capacity: 10 });
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-line rounded-xl">
        <table className="w-full text-[13px]">
          <thead className="bg-panel">
            <tr className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground">
              <th className="text-left px-3 py-2">Slot</th>
              <th className="text-left px-3 py-2">Producto</th>
              <th className="text-right px-3 py-2">Precio</th>
              <th className="text-right px-3 py-2">Stock</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow key={p.id} product={p} machineId={machine.id} />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted-foreground py-8 font-mono text-[11px] uppercase tracking-[0.1em]">
                  Sin slots configurados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {adding ? (
        <form onSubmit={submitNew} className="bg-panel border border-line rounded-xl p-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
          <input
            required
            placeholder="A1"
            value={draft.slot_code}
            onChange={(e) => setDraft({ ...draft, slot_code: e.target.value })}
            className="form-input"
          />
          <input
            required
            placeholder="Producto"
            value={draft.product_name}
            onChange={(e) => setDraft({ ...draft, product_name: e.target.value })}
            className="form-input col-span-2"
          />
          <input
            type="number"
            step="0.1"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
            className="form-input"
          />
          <div className="flex gap-1">
            <input
              type="number"
              value={draft.stock}
              onChange={(e) => setDraft({ ...draft, stock: parseInt(e.target.value) || 0 })}
              className="form-input"
            />
            <input
              type="number"
              value={draft.stock_capacity}
              onChange={(e) => setDraft({ ...draft, stock_capacity: parseInt(e.target.value) || 0 })}
              className="form-input"
            />
          </div>
          <div className="col-span-2 sm:col-span-5 flex gap-2 justify-end">
            <button type="button" onClick={() => setAdding(false)} className="font-mono text-[11px] uppercase text-muted-foreground hover:text-ink px-3">
              Cancelar
            </button>
            <button type="submit" className="bg-ink text-paper font-mono text-[11px] uppercase rounded-full px-4 py-2">
              Añadir
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full inline-flex items-center justify-center gap-2 border border-dashed border-line hover:border-ink/40 font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground hover:text-ink rounded-xl py-3 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Añadir slot
        </button>
      )}
    </div>
  );
}

function ProductRow({ product, machineId }: { product: MachineProduct; machineId: string }) {
  const upsert = useUpsertMachineProduct(machineId);
  const del = useDeleteMachineProduct(machineId);
  const [draft, setDraft] = useState(product);

  useEffect(() => setDraft(product), [product]);

  const commit = (patch: Partial<MachineProduct>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    upsert.mutate({
      id: product.id,
      slot_code: next.slot_code,
      product_name: next.product_name,
      price: next.price,
      stock: next.stock,
      stock_capacity: next.stock_capacity,
    });
  };

  const stockPct = draft.stock_capacity > 0 ? (draft.stock / draft.stock_capacity) * 100 : 0;
  const stockColor = stockPct < 30 ? "bg-destructive" : stockPct < 60 ? "bg-amber-400" : "bg-crypto-green";

  return (
    <tr className="border-t border-line">
      <td className="px-3 py-2">
        <input
          value={draft.slot_code}
          onChange={(e) => setDraft({ ...draft, slot_code: e.target.value })}
          onBlur={() => commit({})}
          className="w-12 bg-transparent font-mono text-[12px] text-ink focus:outline-none"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={draft.product_name}
          onChange={(e) => setDraft({ ...draft, product_name: e.target.value })}
          onBlur={() => commit({})}
          className="w-full bg-transparent text-ink focus:outline-none"
        />
      </td>
      <td className="px-3 py-2 text-right">
        <input
          type="number"
          step="0.1"
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
          onBlur={() => commit({})}
          className="w-16 bg-transparent text-right font-mono text-[12px] text-ink focus:outline-none"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2 justify-end">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={draft.stock}
              onChange={(e) => setDraft({ ...draft, stock: parseInt(e.target.value) || 0 })}
              onBlur={() => commit({})}
              className="w-12 bg-transparent text-right font-mono text-[12px] text-ink focus:outline-none"
            />
            <span className="text-faint">/</span>
            <input
              type="number"
              value={draft.stock_capacity}
              onChange={(e) => setDraft({ ...draft, stock_capacity: parseInt(e.target.value) || 0 })}
              onBlur={() => commit({})}
              className="w-12 bg-transparent text-right font-mono text-[12px] text-ink focus:outline-none"
            />
          </div>
          <div className="w-12 h-1.5 bg-line rounded-full overflow-hidden">
            <div className={`h-full ${stockColor}`} style={{ width: `${Math.min(100, stockPct)}%` }} />
          </div>
        </div>
      </td>
      <td className="px-2">
        <button
          onClick={() => {
            if (confirm(`¿Eliminar slot ${product.slot_code}?`)) del.mutate(product.id);
          }}
          className="text-muted-foreground hover:text-destructive p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ---------- Ventas ----------
function VentasTab({ machine }: { machine: Machine }) {
  const { data: products = [] } = useMachineProducts(machine.id);
  const { data: sales = [] } = useMachineSales(machine.id);
  const create = useCreateMachineSale(machine.id);
  const del = useDeleteMachineSale(machine.id);
  const [productId, setProductId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    const p = products.find((x) => x.id === productId);
    if (p) {
      setPrice(p.price);
      setName(p.product_name);
    }
  }, [productId, products]);

  const totals = useMemo(() => {
    const today = new Date();
    const todayKey = today.toDateString();
    const totalToday = sales
      .filter((s) => new Date(s.sold_at).toDateString() === todayKey)
      .reduce((a, s) => a + Number(s.total), 0);
    const total7d = sales.reduce((a, s) => a + Number(s.total), 0);
    return { totalToday, total7d };
  }, [sales]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await create.mutateAsync({
      product_id: productId || null,
      product_name: name,
      quantity: qty,
      unit_price: price,
    });
    setQty(1);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total hoy" value={`€${totals.totalToday.toFixed(2)}`} />
        <Stat label="Últimos 7d" value={`€${total7d_fmt(totals.total7d)}`} />
      </div>

      <form onSubmit={submit} className="bg-panel border border-line rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground">
            Registrar venta
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="form-input col-span-2"
          >
            <option value="">— Producto libre —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.slot_code} · {p.product_name}
              </option>
            ))}
          </select>
          {!productId && (
            <input
              required
              placeholder="Producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input col-span-2"
            />
          )}
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            className="form-input"
          />
          <input
            type="number"
            step="0.1"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="form-input"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[11px] uppercase rounded-full px-4 py-2 disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="h-3 w-3 animate-spin" />} Registrar
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-line rounded-xl">
        <table className="w-full text-[13px]">
          <thead className="bg-panel">
            <tr className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground">
              <th className="text-left px-3 py-2">Fecha</th>
              <th className="text-left px-3 py-2">Producto</th>
              <th className="text-right px-3 py-2">Qty</th>
              <th className="text-right px-3 py-2">Total</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                  {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s.sold_at))}
                </td>
                <td className="px-3 py-2 text-ink">{s.product_name}</td>
                <td className="px-3 py-2 text-right font-mono">{s.quantity}</td>
                <td className="px-3 py-2 text-right font-mono">€{Number(s.total).toFixed(2)}</td>
                <td className="px-2">
                  <button onClick={() => del.mutate(s.id)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted-foreground py-6 font-mono text-[11px] uppercase tracking-[0.1em]">
                  Sin ventas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function total7d_fmt(n: number) {
  return n.toFixed(2);
}

// ---------- Servicios ----------
function ServiciosTab({ machine }: { machine: Machine }) {
  const { data: services = [] } = useMachineServices(machine.id);
  const create = useCreateMachineService(machine.id);
  const [type, setType] = useState<string>("mantenimiento");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ type, title: title || null, body: body || null });
    setTitle("");
    setBody("");
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="bg-panel border border-line rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-muted-foreground">
            Registrar servicio
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="form-input">
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SERVICE_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="form-input sm:col-span-2"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Descripción (opcional)"
          rows={2}
          className="form-input"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center gap-2 bg-ink text-paper font-mono text-[11px] uppercase rounded-full px-4 py-2 disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="h-3 w-3 animate-spin" />} Registrar
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="bg-paper border border-line rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-faint">
                {SERVICE_LABELS[s.type as keyof typeof SERVICE_LABELS] ?? s.type}
              </span>
              <span className="font-mono text-[10.5px] text-muted-foreground">
                {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "2-digit" }).format(new Date(s.occurred_at))}
              </span>
            </div>
            {s.title && <p className="mt-1 text-[13.5px] text-ink">{s.title}</p>}
            {s.body && <p className="mt-1 text-[13px] text-ink-2 whitespace-pre-wrap">{s.body}</p>}
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-center text-muted-foreground py-6 font-mono text-[11px] uppercase tracking-[0.1em]">
            Sin servicios registrados
          </p>
        )}
      </div>
    </div>
  );
}
