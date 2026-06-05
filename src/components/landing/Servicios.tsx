import { Cpu, RefreshCw, Activity } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const services = [
  {
    icon: Cpu,
    title: "Instalación sin coste",
    body: "Ponemos la máquina en tu local sin que inviertas un solo euro. Solo necesitas un enchufe y un metro cuadrado.",
  },
  {
    icon: RefreshCw,
    title: "Reposición y mantenimiento",
    body: "Nos encargamos del stock, la limpieza y las averías. Tú solo disfrutas del servicio para tus clientes.",
  },
  {
    icon: Activity,
    title: "Telemetría inteligente",
    body: "Cada máquina envía datos en tiempo real: stock, ventas, temperatura. Optimizamos sin que tengas que llamarnos.",
  },
];

export function Servicios() {
  return (
    <section id="servicios" className="border-t border-line bg-paper">
      <div className="container py-24 md:py-32">
        <Reveal>
          <SectionHeader
            num="01"
            eyebrow="Qué hacemos"
            title="Vending como servicio."
            description="Nos encargamos de todo: máquina, instalación, reposición de stock, mantenimiento y tecnología. Sin inversión ni gestión para ti."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <article className="group h-full rounded-2xl border border-line bg-paper p-7 transition-all hover:border-ink/25 hover:shadow-[0_18px_60px_-30px_hsl(var(--ink)/0.25)]">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-panel border border-line text-signal-blue group-hover:bg-ink group-hover:text-paper transition-colors">
                  <s.icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="mt-6 text-[20px] tracking-[-0.01em] text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
