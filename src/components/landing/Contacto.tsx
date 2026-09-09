import { useState, FormEvent } from "react";
import { Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const venueTypes = [
  "Gimnasio",
  "Hotel",
  "Oficina",
  "Centro deportivo",
  "Universidad",
  "Local a pie de calle",
  "Otro",
];

const CONTACT_EMAIL = "hola@vendai.es";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;

export function Contacto() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: si un bot rellena el campo oculto, fingimos éxito y no guardamos.
    if (data.get("company")) {
      form.reset();
      toast({
        title: "Solicitud recibida",
        description: "Te contactaremos en menos de 24 h para coordinar una visita.",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("contact_requests").insert({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      phone: String(data.get("phone") ?? "").trim() || null,
      venue: String(data.get("venue") ?? "").trim() || null,
      message: String(data.get("message") ?? "").trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar la solicitud",
        description: `Inténtalo de nuevo en unos minutos o escríbenos a ${CONTACT_EMAIL}.`,
      });
      return;
    }

    form.reset();
    toast({
      title: "Solicitud recibida",
      description: "Te contactaremos en menos de 24 h para coordinar una visita.",
    });
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
                    id="name"
                    name="name"
                    required
                    maxLength={200}
                    autoComplete="name"
                    className="form-input"
                    placeholder="Tu nombre"
                  />
                </Field>
                <Field label="Email" name="email" required>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={320}
                    autoComplete="email"
                    className="form-input"
                    placeholder="tu@empresa.com"
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Teléfono" name="phone">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength={40}
                    autoComplete="tel"
                    className="form-input"
                    placeholder="+34 600 000 000"
                  />
                </Field>
                <Field label="Tipo de establecimiento" name="venue" required>
                  <select id="venue" name="venue" required className="form-input">
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
                  id="message"
                  name="message"
                  rows={4}
                  maxLength={4000}
                  className="form-input resize-none"
                  placeholder="Cuéntanos sobre el espacio, tráfico, horarios…"
                />
              </Field>

              {/* Honeypot anti-spam: oculto para personas, tentador para bots. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <label className="flex items-start gap-3 text-[13px] leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-1 h-4 w-4 flex-none accent-signal-blue"
                />
                <span>
                  He leído y acepto la{" "}
                  <a href="/privacidad" className="underline underline-offset-2 hover:text-ink">
                    política de privacidad
                  </a>
                  . Usamos tus datos solo para responder a esta solicitud.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="group mt-2 inline-flex items-center justify-center gap-2 bg-signal text-paper font-mono text-[12.5px] tracking-[0.08em] uppercase px-6 py-3.5 rounded-full disabled:opacity-60 transition-[transform,box-shadow,opacity] duration-300 shadow-[0_8px_30px_-8px_hsl(var(--signal-blue)/0.55)] hover:scale-[1.02] hover:shadow-[0_14px_44px_-10px_hsl(var(--signal-blue)/0.75)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue focus-visible:ring-offset-2"
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
                href={`mailto:${CONTACT_EMAIL}`}
                className="group rounded-2xl border border-line bg-paper p-7 hover:border-ink/30 transition-colors"
              >
                <span className="eyebrow">Email</span>
                <div className="mt-4 flex items-center gap-3">
                  <Mail
                    className="h-5 w-5 text-signal-blue"
                    strokeWidth={1.7}
                  />
                  <span className="font-mono text-[15.5px] text-ink group-hover:underline underline-offset-4">
                    {CONTACT_EMAIL}
                  </span>
                </div>
              </a>

              {WHATSAPP_NUMBER && (
                <div className="rounded-2xl border border-line p-7 bg-[#0E1116] text-paper">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-crypto-green">
                    WhatsApp
                  </span>
                  <p className="mt-4 text-[15.5px] leading-relaxed text-paper/80">
                    También puedes escribirnos por WhatsApp y te respondemos en
                    minutos.
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-5 inline-flex items-center justify-center gap-2 bg-crypto-green text-ink font-mono text-[12.5px] tracking-[0.08em] uppercase px-5 py-3 rounded-full hover:opacity-95 transition-opacity"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2} />
                    Abrir WhatsApp
                  </a>
                </div>
              )}
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
