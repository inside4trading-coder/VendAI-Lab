import { Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const give = [
  "Un metro cuadrado con enchufe",
  "Acceso para reposición (1-2 veces/semana)",
];

const provide = [
  "Máquina de última generación",
  "Stock completo (snacks + bebidas)",
  "Mantenimiento y soporte técnico",
  "Tecnología cashless y telemetría",
  "Comisión por ventas para tu negocio",
];

function Column({
  label,
  title,
  items,
  accent,
}: {
  label: string;
  title: string;
  items: string[];
  accent: "ink" | "blue";
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="eyebrow">{label}</span>
        <h3 className="mt-3 text-[24px] tracking-[-0.01em] text-ink">
          {title}
        </h3>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3">
            <span
              className={
                accent === "blue"
                  ? "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-signal text-paper flex-none"
                  : "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink text-paper flex-none"
              }
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-[15.5px] leading-relaxed text-ink-2">
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Modelo() {
  return (
    <section id="modelo" className="border-t border-line bg-panel">
      <div className="container py-24 md:py-32">
        <Reveal>
          <SectionHeader
            num="04"
            eyebrow="Modelo de negocio"
            title={
              <>
                Tú pones el espacio.
                <br />
                Nosotros ponemos todo lo demás.
              </>
            }
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-14 rounded-3xl bg-paper border border-line p-8 md:p-12">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <Column
                label="A · Local"
                title="Lo que tú aportas"
                items={give}
                accent="ink"
              />
              <Column
                label="B · VendAI"
                title="Lo que nosotros ponemos"
                items={provide}
                accent="blue"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div
            className="mt-6 rounded-3xl p-8 md:p-10 border border-line relative overflow-hidden"
            style={{
              background: `
                linear-gradient(120deg, hsl(var(--signal-blue) / 0.10) 0%, hsl(var(--aqua) / 0.10) 100%),
                hsl(var(--paper))
              `,
            }}
          >
            <span className="eyebrow text-ink-2">Comisión</span>
            <p className="mt-3 text-[clamp(20px,2.4vw,30px)] leading-snug tracking-[-0.015em] text-ink font-mono font-semibold">
              Cada local recibe una comisión del{" "}
              <span className="text-signal">10% al 20%</span> sobre las ventas
              netas de la máquina.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
