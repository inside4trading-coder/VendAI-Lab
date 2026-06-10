import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { AnimatedValue } from "./AnimatedValue";

const stats = [
  { value: "15.000€", label: "Inversión inicial por máquina" },
  { value: "30-50%", label: "Margen bruto por máquina" },
  { value: "12-18", label: "Meses de payback estimado" },
];

const pillars = [
  {
    dot: "bg-signal-blue",
    title: "AI-Native",
    body: "Productos donde el modelo de IA es el producto. Agentes y automatización.",
  },
  {
    dot: "bg-crypto-green",
    title: "Crypto",
    body: "Liquidez, pagos y propiedad on-chain para máquinas autónomas.",
  },
  {
    dot: "bg-ventures-violet",
    title: "Tradicional",
    body: "Negocios físicos con márgenes reales, reinventados con tecnología.",
  },
];

export function Inversores() {
  return (
    <section id="inversores" className="bg-ink text-paper relative overflow-hidden">
      {/* Aura */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(50% 40% at 80% 0%, hsl(var(--signal-blue) / 0.18), transparent 60%),
            radial-gradient(40% 35% at 10% 100%, hsl(var(--crypto-green) / 0.12), transparent 60%)
          `,
        }}
      />

      <div className="container relative py-24 md:py-32">
        <Reveal>
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[12px] text-paper/40 tracking-[0.04em]">
                — 05
              </span>
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-aqua">
                Para inversores
              </span>
            </div>
            <h2 className="text-[clamp(32px,5vw,58px)] leading-[1.04] tracking-[-0.03em] text-paper max-w-3xl">
              Retail operado por software.
            </h2>
            <p className="mt-2 text-[clamp(17px,1.5vw,20px)] leading-relaxed text-paper/70 max-w-2xl">
              VendAI es un venture lab que incuba proyectos en la frontera de la
              inteligencia artificial y los negocios físicos. Nuestra primera
              vertical son las máquinas de vending autónomas:{" "}
              <strong className="text-paper font-semibold">
                retail sin fricción, siempre encendido, operado por software
              </strong>
              .
            </p>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={120}>
          <div className="mt-16 grid gap-px sm:grid-cols-3 rounded-2xl overflow-hidden border border-paper/10 bg-paper/10">
            {stats.map((s) => (
              <div key={s.label} className="bg-ink p-8">
                <AnimatedValue
                  value={s.value}
                  className="block text-signal text-[clamp(36px,5vw,56px)] font-mono font-semibold leading-none tracking-[-0.02em]"
                />
                <span className="mt-4 block text-paper/65 text-sm leading-relaxed">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-12">
            <a
              href="#contacto"
              className="group inline-flex items-center gap-2 border border-paper/30 text-paper font-mono text-[12.5px] tracking-[0.08em] uppercase px-6 py-3.5 rounded-full hover:bg-paper hover:text-ink hover:scale-[1.02] active:scale-[0.99] transition-[background-color,color,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Hablar con el equipo
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>

        {/* Pillars */}
        <Reveal delay={260}>
          <div className="mt-20 grid gap-px sm:grid-cols-3 rounded-2xl overflow-hidden border border-paper/10 bg-paper/10">
            {pillars.map((p) => (
              <div key={p.title} className="bg-ink p-8">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-paper/55">
                    Vertical
                  </span>
                </div>
                <h3 className="mt-5 text-[20px] tracking-[-0.01em] text-paper">
                  {p.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-paper/65">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
