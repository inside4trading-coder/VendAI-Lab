import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";

const cols = [
  {
    title: "Servicios",
    links: [
      { label: "Vending autónomo", href: "#servicios" },
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Para quién", href: "#para-quien" },
      { label: "Modelo", href: "#modelo" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Lab", href: "/" },
      { label: "Inversores", href: "#inversores" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso legal", href: "/aviso-legal" },
      { label: "Privacidad", href: "/privacidad" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size={30} tone="white" />
            <p className="mt-6 text-sm text-paper/65 max-w-xs leading-relaxed">
              Laboratorio de proyectos AI-Native, Crypto y negocios físicos.
              Construye, prueba y despliega máquinas autónomas.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-paper/55 mb-5">{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) =>
                  l.href.startsWith("#") || l.href === "/" ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-paper/85 hover:text-paper transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        to={l.href}
                        className="text-sm text-paper/85 hover:text-paper transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-6 border-t border-paper/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-paper/55">
            VendAI Labs © 2026
          </span>
          <span className="font-mono text-[11.5px] tracking-[0.22em] uppercase text-paper/45">
            build · ship · repeat
          </span>
        </div>
      </div>
    </footer>
  );
}
