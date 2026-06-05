import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  MapPin,
  TrendingUp,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { ChipLogo } from "@/components/brand/ChipLogo";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Máquinas", url: "/app/maquinas", icon: Cpu },
  { title: "CRM", url: "/app/ubicaciones", icon: MapPin },
  { title: "Finanzas", url: "/app/finanzas", icon: TrendingUp },
  { title: "Configuración", url: "/app/configuracion", icon: Settings },
];

const DRIVE_URL = "https://drive.google.com";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const meta = (user?.user_metadata as Record<string, unknown> | undefined) ?? {};
  const nombre =
    (meta.full_name as string) ||
    (meta.name as string) ||
    user?.email?.split("@")[0] ||
    "Operador";
  const initial = (nombre[0] || "V").toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-5">
        <div className="flex items-center h-9">
          {collapsed ? (
            <ChipLogo variant="white" size={28} className="mx-auto" />
          ) : (
            <Logo size={22} tone="white" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-sidebar-foreground/45 px-3">
              Lab
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={cn(
                        "font-mono text-[12.5px] tracking-[0.04em] uppercase text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:border-l-2 data-[active=true]:border-signal-blue",
                      )}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-3 mx-3 h-px bg-sidebar-border" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Carpeta Drive"
                  className="font-mono text-[12.5px] tracking-[0.04em] uppercase text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <a href={DRIVE_URL} target="_blank" rel="noreferrer noopener">
                    <ExternalLink className="h-4 w-4" />
                    <span>Carpeta Drive</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {collapsed ? (
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="mx-auto h-9 w-9 rounded-full bg-sidebar-accent text-sidebar-foreground flex items-center justify-center font-mono text-[12px] font-semibold"
          >
            {initial}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-signal flex items-center justify-center text-white font-mono text-[13px] font-semibold flex-none">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-sidebar-foreground truncate">{nombre}</p>
              <p className="font-mono text-[10.5px] tracking-[0.04em] text-sidebar-foreground/45 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="h-8 w-8 rounded-md text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
