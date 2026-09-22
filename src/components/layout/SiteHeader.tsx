import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#para-quien", label: "Para quién" },
  { href: "#modelo", label: "Modelo" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "bg-paper/80 backdrop-blur-md border-b border-line shadow-[0_8px_30px_-18px_hsl(var(--ink)/0.25)]"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="VendAI · Inicio">
          <Logo size={26} />
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-7">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-[12px] tracking-[0.08em] uppercase text-muted-foreground hover:text-ink transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="font-mono text-[12px] tracking-[0.08em] uppercase text-muted-foreground hover:text-ink transition-colors px-3 py-2.5"
          >
            Acceder
          </Link>
          <a
            href="#contacto"
            className="font-mono text-[12px] tracking-[0.08em] uppercase text-paper bg-ink px-4 py-2.5 rounded-full hover:bg-ink-2 hover:scale-[1.03] active:scale-[0.99] transition-[background-color,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue focus-visible:ring-offset-2"
          >
            Solicitar instalación →
          </a>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-line text-ink"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-line bg-paper">
          <div className="container flex flex-col py-4 gap-1">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm uppercase tracking-[0.06em] py-2.5 text-ink-2"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="font-mono text-sm uppercase tracking-[0.06em] py-2.5 text-ink-2"
            >
              Acceder al backoffice
            </Link>
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="font-mono text-sm uppercase tracking-[0.06em] text-paper bg-ink px-4 py-3 rounded-full text-center mt-3"
            >
              Solicitar instalación →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
