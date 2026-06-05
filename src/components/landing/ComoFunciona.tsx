import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Contacto",
    body: "Nos cuentas sobre tu espacio: tipo de local, tráfico diario y ubicación del punto de instalación.",
  },
  {
    n: "02",
    title: "Propuesta",
    body: "Visitamos tu local, evaluamos el potencial y te presentamos una propuesta a medida. Sin compromiso.",
  },
  {
    n: "03",
    title: "Instalación",
    body: "Colocamos la máquina, la conectamos y empiezas a ofrecer el servicio desde el día uno.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="border-t border-line bg-panel">
      <div className="container py-24 md:py-32">
        <Reveal>
          <SectionHeader
            num="02"
            eyebrow="Proceso"
            title="Tres pasos. Cero complicaciones."
          />
        </Reveal>

        <div className="mt-14 relative">
          {/* línea conectora desktop */}
          <div
            aria-hidden
            className="hidden md:block absolute top-[34px] left-[8%] right-[8%] h-px bg-line"
          />
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8 relative">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <li className="relative">
                  <div className="flex items-center justify-center h-[68px] w-[68px] rounded-full bg-paper border border-line font-mono text-[18px] text-ink tracking-tight">
                    {s.n}
                  </div>
                  <h3 className="mt-7 text-[22px] tracking-[-0.01em] text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2 max-w-[34ch]">
                    {s.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
