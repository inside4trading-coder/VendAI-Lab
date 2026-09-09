import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeSync } from "@/components/app/ThemeSync";

import SiteLayout from "@/components/layout/SiteLayout";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Páginas legales con carga diferida (rara vez visitadas).
const Privacidad = lazy(() =>
  import("./pages/legal/LegalPages").then((m) => ({ default: m.Privacidad })),
);
const AvisoLegal = lazy(() =>
  import("./pages/legal/LegalPages").then((m) => ({ default: m.AvisoLegal })),
);
const Cookies = lazy(() =>
  import("./pages/legal/LegalPages").then((m) => ({ default: m.Cookies })),
);

// Backoffice con carga diferida: la landing no paga su peso (recharts, xlsx…)
const AppLayout = lazy(() => import("@/components/layout/AppLayout"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/app/Dashboard"));
const Maquinas = lazy(() => import("./pages/app/Maquinas"));
const Ubicaciones = lazy(() => import("./pages/app/Ubicaciones"));
const Finanzas = lazy(() => import("./pages/app/Finanzas"));
const Configuracion = lazy(() => import("./pages/app/Configuracion"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-muted-foreground animate-pulse">
        Cargando…
      </span>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeSync />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Landing single-page + páginas legales */}
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/aviso-legal" element={<AvisoLegal />} />
                <Route path="/cookies" element={<Cookies />} />
              </Route>

              {/* Auth */}
              <Route path="/login" element={<Login />} />

              {/* App shell (protegido) */}
              <Route
                path="/app"
                element={
                  <AuthGuard>
                    <AppLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="maquinas" element={<Maquinas />} />
                <Route path="ubicaciones" element={<Ubicaciones />} />
                <Route path="finanzas" element={<Finanzas />} />
                <Route path="configuracion" element={<Configuracion />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
