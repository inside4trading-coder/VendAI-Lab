import { ArrowRight } from "lucide-react";
import { AnimatedChip } from "@/components/brand/AnimatedChip";
import { HeroBackground } from "./HeroBackground";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Aura de fondo signal-blue + crypto-green sutil (fallback estático del 3D) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background: `
            radial-gradient(60% 50% at 78% 25%, hsl(var(--signal-blue) / 0.10), transparent 60%),
            radial-gradient(50% 40% at 12% 90%, hsl(var(--crypto-green) / 0.06), transparent 60%),
            hsl(var(--paper))
          `,
        }}
      />

      {/* Campo de partículas 3D (desktop, motion OK) */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <HeroBackground />
      </div>

      <div className="container pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 items-center">
          {/* Columna texto */}
          <div className="animate-fade-up">
            <span className="eyebrow">Vending Inteligente en España</span>
            <h1 className="mt-6 text-[clamp(36px,6.5vw,68px)] leading-[1.02] tracking-[-0.035em] text-ink">
              Máquinas que operan solas.
              <br />
              <span className="text-ink-2">Ingresos que se generan solos.</span>
            </h1>
            <p className="mt-7 text-[clamp(17px,1.4vw,21px)] leading-relaxed text-ink-2 max-w-xl">
              Instalamos máquinas de vending de última generación en tu
              establecimiento sin ningún coste. Tú aportas el espacio,{" "}
              <strong className="text-ink font-semibold">
                nosotros ponemos la tecnología
              </strong>
              .
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <a
                href="#contacto"
                className="group inline-flex items-center justify-center gap-2 bg-signal text-paper font-mono text-[12.5px] tracking-[0.08em] uppercase px-6 py-3.5 rounded-full transition-[transform,box-shadow] duration-300 shadow-[0_8px_30px_-8px_hsl(var(--signal-blue)/0.55)] hover:scale-[1.02] hover:shadow-[0_14px_44px_-10px_hsl(var(--signal-blue)/0.75)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue focus-visible:ring-offset-2"
              >
                Solicitar instalación gratuita
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Columna visual: chip con glow */}
          <div className="relative flex items-center justify-center min-h-[280px] md:min-h-[380px]">
            {/* Glow */}
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-[78%] aspect-square rounded-full blur-3xl bg-signal animate-glow-pulse"
                style={{ opacity: 0.35 }}
              />
            </div>
            {/* Chip animado */}
            <div className="relative animate-chip-float">
              <AnimatedChip
                className="w-[280px] md:w-[360px] drop-shadow-[0_20px_40px_rgba(43,127,245,0.25)]"
              />
            </div>
          </div>
        </div>

        {/* Stat bar */}
        <div className="mt-20 md:mt-24 pt-7 border-t border-line">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11.5px] tracking-[0.14em] uppercase text-muted-foreground">
            {[
              "Lanzando en Madrid",
              "Tecnología cashless",
              "Telemetría en tiempo real",
              "Sin coste para el local",
            ].map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-faint" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
