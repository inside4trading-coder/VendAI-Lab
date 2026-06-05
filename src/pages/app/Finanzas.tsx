import { useEffect, useMemo, useState } from "react";

interface Inputs {
  ventas: number;
  dias: number;
  precio: number;
  coste: number;
  comision: number;
  otros: number;
}

const defaults: Inputs = {
  ventas: 40,
  dias: 22,
  precio: 1.5,
  coste: 0.6,
  comision: 15,
  otros: 50,
};

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const eur2 = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground mb-2">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className="form-input font-mono text-[15px]"
      />
    </label>
  );
}

export default function Finanzas() {
  const [v, setV] = useState<Inputs>(defaults);

  useEffect(() => {
    document.title = "Finanzas · VendAI";
  }, []);

  const calc = useMemo(() => {
    const ingresoBruto = v.ventas * v.dias * v.precio;
    const costeProducto = v.ventas * v.dias * v.coste;
    const comisionLocal = ingresoBruto * (v.comision / 100);
    const beneficioNeto = ingresoBruto - costeProducto - comisionLocal - v.otros;
    const beneficioAnual = beneficioNeto * 12;
    const roi = beneficioNeto > 0 ? (beneficioAnual / 5000) * 100 : 0;
    const payback = beneficioNeto > 0 ? 5000 / beneficioNeto : Infinity;
    return {
      ingresoBruto,
      costeProducto,
      comisionLocal,
      beneficioNeto,
      beneficioAnual,
      roi,
      payback,
    };
  }, [v]);

  const set = (k: keyof Inputs) => (n: number) => setV((p) => ({ ...p, [k]: n }));

  return (
    <section className="container py-10 space-y-6">
      <div>
        <span className="eyebrow">Lab · Finanzas</span>
        <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] leading-tight tracking-tight text-ink">
          Simulador Financiero
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground max-w-xl">
          Calcula el beneficio mensual y márgenes por máquina.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* INPUTS */}
        <div className="bg-paper border border-line rounded-xl p-6">
          <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink mb-5">
            Variables de entrada
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField label="Ventas diarias (unidades)" value={v.ventas} onChange={set("ventas")} />
            <NumberField label="Días activos al mes" value={v.dias} onChange={set("dias")} />
            <NumberField label="Precio medio de venta (€)" value={v.precio} step={0.1} onChange={set("precio")} />
            <NumberField label="Coste medio del producto (€)" value={v.coste} step={0.1} onChange={set("coste")} />
            <NumberField label="Comisión del local (%)" value={v.comision} onChange={set("comision")} />
            <NumberField
              label="Otros costes mensuales (€)"
              value={v.otros}
              onChange={set("otros")}
              placeholder="Seguro, gasolina..."
            />
          </div>
        </div>

        {/* RESULTADO */}
        <div className="relative overflow-hidden bg-[#0E1116] text-white rounded-xl p-6 flex flex-col">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(60%_50%_at_70%_20%,rgba(26,140,255,0.7),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-[15px] font-mono font-semibold tracking-tight">
              Beneficio Neto Estimado
            </h2>
            <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-white/40 mt-1">
              Por máquina / mensual
            </p>
          </div>

          <div className="relative flex-1 flex items-center justify-center py-10">
            <span
              className="text-signal font-bold tracking-tight leading-none"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "clamp(48px, 6.5vw, 78px)",
              }}
            >
              {eur.format(calc.beneficioNeto)}
            </span>
          </div>

          <div className="relative grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-4">
            <div className="px-2 first:pl-0">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/40">
                Ingreso Bruto
              </p>
              <p className="mt-1.5 font-mono text-[16px] font-semibold text-white">
                {eur.format(calc.ingresoBruto)}
              </p>
            </div>
            <div className="px-3">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/40">
                Coste Producto
              </p>
              <p className="mt-1.5 font-mono text-[16px] font-semibold text-[#FF6B7A]">
                −{eur.format(calc.costeProducto)}
              </p>
            </div>
            <div className="px-3">
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/40">
                Comisión Local
              </p>
              <p className="mt-1.5 font-mono text-[16px] font-semibold text-[#FF6B7A]">
                −{eur.format(calc.comisionLocal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proyección anual */}
      <div className="bg-paper border border-line rounded-xl p-6">
        <h2 className="text-[15px] font-mono font-semibold tracking-tight text-ink mb-5">
          Proyección anual
          <span className="ml-2 font-normal text-muted-foreground text-[12px]">
            (asumiendo coste de máquina: €5.000)
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-line p-5">
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">
              Beneficio anual
            </p>
            <p
              className="mt-2 font-bold tracking-tight text-ink"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30 }}
            >
              {eur.format(calc.beneficioAnual)}
            </p>
          </div>
          <div className="rounded-xl border border-line p-5">
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">
              ROI anual
            </p>
            <p
              className="mt-2 font-bold tracking-tight text-crypto-green"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30 }}
            >
              {calc.roi.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-line p-5">
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground">
              Payback
            </p>
            <p
              className="mt-2 font-bold tracking-tight text-signal-blue"
              style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30 }}
            >
              {Number.isFinite(calc.payback) ? `${calc.payback.toFixed(1)} meses` : "—"}
            </p>
          </div>
        </div>
        <p className="mt-5 font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
          Detalle:{" "}
          <span className="text-ink">Ingreso bruto {eur2.format(calc.ingresoBruto)}</span> · Coste{" "}
          <span className="text-ink">{eur2.format(calc.costeProducto)}</span> · Comisión{" "}
          <span className="text-ink">{eur2.format(calc.comisionLocal)}</span> · Otros{" "}
          <span className="text-ink">{eur2.format(v.otros)}</span>
        </p>
      </div>
    </section>
  );
}
