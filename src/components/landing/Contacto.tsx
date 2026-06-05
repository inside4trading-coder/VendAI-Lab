import { useState, FormEvent } from "react";
import { Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const venueTypes = [
  "Gimnasio",
  "Hotel",
  "Oficina",
  "Centro deportivo",
  "Otro",
];

export function Contacto() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast({
        title: "Solicitud recibida",
        description:
          "Te contactaremos en menos de 24 h para coordinar una visita.",
      });
    }, 700);
  }

  return (
    <section id="contacto" className="border-t border-line bg-paper">
      <div className="container py-24 md:py-32">
        <Reveal>
          <SectionHeader
            num="06"
            eyebrow="Contacto"
            title="Hablemos de tu espacio."
            description="Cuéntanos sobre tu local y te respondemos en menos de 24 horas con una propuesta inicial."
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          {/* Form */}
          <Reveal>
            <form
              onSubmit={onSubmit}
              className="rounded-3xl bg-panel border border-line p-7 md:p-9 flex flex-col gap-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nombre" name="name" required>
                  <input
                    name="name"
                    required
                    className="form-input"
                    placeholder="Tu nombre"
                  />
                </Field>
                <Field label="Email" name="email" required>
                  <input
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="tu@empresa.com"
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Teléfono" name="phone">
                  <input
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="+34 600 000 000"
                  />
                </Field>
                <Field label="Tipo de establecimiento" name="venue" required>
                  <select name="venue" required className="form-input">
                    <option value="">Selecciona…</option>
                    {venueTypes.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Mensaje" name="message">
                <textarea
                  name="message"
                  rows={4}
                  className="form-input resize-none"
                  placeholder="Cuéntanos sobre el espacio, tráfico, horarios…"
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="group mt-2 inline-flex items-center justify-center gap-2 bg-signal text-paper font-mono text-[12.5px] tracking-[0.08em] uppercase px-6 py-3.5 rounded-full hover:opacity-95 disabled:opacity-60 transition-opacity shadow-[0_8px_30px_-8px_hsl(var(--signal-blue)/0.55)]"
              >
                {submitting ? "Enviando…" : "Enviar solicitud"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </Reveal>

          {/* Info */}
          <Reveal delay={120}>
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-line bg-paper p-7">
                <span className="eyebrow">Sede</span>
                <div className="mt-4 flex items-start gap-3">
                  <MapPin
                    className="h-5 w-5 text-signal-blue mt-0.5"
                    strokeWidth={1.7}
                  />
                  <div>
                    <p className="text-ink font-medium">Madrid, España</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Operando en toda la zona metropolitana.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="mailto:hola@vendai.lab"
                className="group rounded-2xl border border-line bg-paper p-7 hover:border-ink/30 transition-colors"
              >
                <span className="eyebrow">Email</span>
                <div className="mt-4 flex items-center gap-3">
                  <Mail
                    className="h-5 w-5 text-signal-blue"
                    strokeWidth={1.7}
                  />
                  <span className="font-mono text-[15.5px] text-ink group-hover:underline underline-offset-4">
                    hola@vendai.lab
                  </span>
                </div>
              </a>

              <div className="rounded-2xl border border-line p-7 bg-[#0E1116] text-paper">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-crypto-green">
                  WhatsApp
                </span>
                <p className="mt-4 text-[15.5px] leading-relaxed text-paper/80">
                  También puedes escribirnos por WhatsApp y te respondemos en
                  minutos.
                </p>
                <a
                  href="https://wa.me/34600000000"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-5 inline-flex items-center justify-center gap-2 bg-crypto-green text-ink font-mono text-[12.5px] tracking-[0.08em] uppercase px-5 py-3 rounded-full hover:opacity-95 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} className="flex flex-col gap-2">
      <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
        {label}
        {required && <span className="text-signal-blue">*</span>}
      </span>
      {children}
    </label>
  );
}
