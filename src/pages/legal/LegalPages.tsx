import { ReactNode } from "react";

/**
 * Páginas legales — BORRADOR.
 *
 * El contenido de abajo es un esqueleto conforme a RGPD/LOPDGDD y LSSI-CE
 * pero AÚN NO ES DEFINITIVO. Antes de campaña de captación hay que:
 *   1. Rellenar los datos del responsable ([RAZÓN SOCIAL], [NIF], [DIRECCIÓN]).
 *      Mientras se opere como autónomo: nombre y apellidos + NIF + domicilio fiscal.
 *   2. Revisar los textos con asesoría legal.
 *   3. Confirmar la finalidad y la base jurídica reales del tratamiento.
 */

const LAST_UPDATED = "9 de septiembre de 2026";
const CONTACT_EMAIL = "hola@vendai.es";

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line bg-paper">
      <div className="container max-w-3xl py-24 md:py-32">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-4 text-[clamp(30px,4.5vw,48px)] leading-[1.05] tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
          Última actualización: {LAST_UPDATED}
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-panel p-5 text-[14px] leading-relaxed text-muted-foreground">
          <strong className="text-ink">Documento en preparación.</strong> Este texto
          es un borrador y será revisado por asesoría legal antes de su versión
          definitiva.
        </div>

        <div className="mt-10 flex flex-col gap-6 text-[15.5px] leading-relaxed text-ink-2 [&_h2]:mt-8 [&_h2]:text-[19px] [&_h2]:tracking-[-0.01em] [&_h2]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {children}
        </div>

        <a
          href="/"
          className="mt-14 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-muted-foreground hover:text-ink transition-colors"
        >
          ← Volver al inicio
        </a>
      </div>
    </section>
  );
}

export function Privacidad() {
  return (
    <LegalLayout title="Política de privacidad">
      <h2>1. Responsable del tratamiento</h2>
      <p>
        [RAZÓN SOCIAL / NOMBRE Y APELLIDOS] — NIF [NIF] — Domicilio: [DIRECCIÓN],
        Madrid, España. Contacto: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Datos que tratamos</h2>
      <p>
        Los que nos facilitas en el formulario de contacto: nombre, correo
        electrónico, teléfono (opcional), tipo de establecimiento y el mensaje
        que escribas.
      </p>

      <h2>3. Finalidad y base jurídica</h2>
      <p>
        Tratamos tus datos únicamente para atender y responder a tu solicitud y,
        en su caso, preparar una propuesta comercial. La base jurídica es tu
        consentimiento, que otorgas al marcar la casilla del formulario, y la
        aplicación de medidas precontractuales a petición tuya.
      </p>

      <h2>4. Conservación</h2>
      <p>
        Conservamos los datos mientras dure la relación y, después, durante los
        plazos legalmente exigibles. Si la solicitud no prospera, se suprimen en
        un plazo máximo de [PLAZO] meses.
      </p>

      <h2>5. Destinatarios</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Utilizamos
        proveedores tecnológicos (alojamiento y base de datos) que actúan como
        encargados del tratamiento: [PROVEEDORES].
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión,
        oposición, limitación y portabilidad escribiendo a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. También puedes
        reclamar ante la Agencia Española de Protección de Datos
        (<a href="https://www.aepd.es" target="_blank" rel="noreferrer noopener">www.aepd.es</a>).
      </p>
    </LegalLayout>
  );
}

export function AvisoLegal() {
  return (
    <LegalLayout title="Aviso legal">
      <h2>1. Titular del sitio</h2>
      <p>
        [RAZÓN SOCIAL / NOMBRE Y APELLIDOS] — NIF [NIF] — Domicilio: [DIRECCIÓN],
        Madrid, España. Correo: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Objeto</h2>
      <p>
        Este sitio web informa sobre los servicios de instalación y explotación
        de máquinas de vending de VendAI y permite solicitar información.
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        Los contenidos, marcas y elementos gráficos de este sitio pertenecen a su
        titular o se usan con autorización. No se permite su reproducción sin
        consentimiento.
      </p>

      <h2>4. Responsabilidad</h2>
      <p>
        El titular no se responsabiliza de los daños derivados del uso del sitio
        ni de la indisponibilidad temporal por causas técnicas.
      </p>

      <h2>5. Legislación aplicable</h2>
      <p>Este aviso se rige por la legislación española.</p>
    </LegalLayout>
  );
}

export function Cookies() {
  return (
    <LegalLayout title="Política de cookies">
      <h2>1. Qué son las cookies</h2>
      <p>
        Son pequeños archivos que un sitio web guarda en tu navegador para
        recordar información sobre tu visita.
      </p>

      <h2>2. Cookies que utilizamos</h2>
      <ul>
        <li>
          <strong>Técnicas / necesarias:</strong> imprescindibles para el
          funcionamiento del sitio. No requieren consentimiento.
        </li>
        <li>
          <strong>Analíticas:</strong> [PENDIENTE DE CONFIRMAR]. Si se activa una
          herramienta de analítica, se detallará aquí y, si procede, se solicitará
          consentimiento previo.
        </li>
      </ul>

      <h2>3. Gestión</h2>
      <p>
        Puedes configurar o eliminar las cookies desde los ajustes de tu
        navegador.
      </p>
    </LegalLayout>
  );
}
