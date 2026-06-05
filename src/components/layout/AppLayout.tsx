import { Outlet, useLocation, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ChipLogo } from "@/components/brand/ChipLogo";

const titles: Record<string, string> = {
  "/app": "Dashboard",
  "/app/dashboard": "Dashboard",
  "/app/maquinas": "Máquinas",
  "/app/ubicaciones": "CRM",
  "/app/finanzas": "Finanzas",
  "/app/configuracion": "Configuración",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Lab";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-paper">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-line bg-paper/85 backdrop-blur-md sticky top-0 z-30 px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-ink" />
              <span className="hidden sm:block h-5 w-px bg-line" />
              <span className="eyebrow hidden sm:inline-flex">
                Lab · {title}
              </span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 font-mono text-[11.5px] tracking-[0.06em] uppercase text-muted-foreground hover:text-ink transition-colors"
              aria-label="Ir al landing"
            >
              <ChipLogo variant="gradient" size={18} />
              vendai.lab
            </Link>
          </header>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
