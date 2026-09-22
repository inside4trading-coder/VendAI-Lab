import { GraduationCap, Store, Building2, Trophy } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const venues = [
  {
    icon: GraduationCap,
    title: "Universidades",
    body: "Alto tráfico de estudiantes todo el día, en un entorno cerrado y con horarios extendidos.",
  },
  {
    icon: Trophy,
    title: "Centros deportivos",
    body: "Pistas de pádel, piscinas, polideportivos: alto tráfico y demanda constante.",
  },
  {
    icon: Store,
    title: "Locales a pie de calle",
    body: "Comercios con tráfico peatonal constante y horario amplio, ideales para vending autónomo.",
  },
  {
    icon: Building2,
    title: "Oficinas",
    body: "Un punto de avituallamiento para tus equipos sin gestionarlo tú. Beneficio corporativo a coste cero.",
  },
];

export function ParaQuien() {
  return (
    <section id="para-quien" className="border-t border-line bg-paper">
      <div className="container py-24 md:py-32">
        <Reveal>
          <SectionHeader
            num="03"
            eyebrow="Ubicaciones ideales"
            title="Si tienes tráfico, tienes negocio."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((v, i) => (
            <Reveal key={v.title} delay={i * 70}>
              <article className="group h-full rounded-2xl border border-line bg-paper p-6 transition-all hover:border-ink/30 hover:-translate-y-0.5">
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-ink text-paper">
                  <v.icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="mt-6 text-[19px] tracking-[-0.01em] text-ink">
                  {v.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
