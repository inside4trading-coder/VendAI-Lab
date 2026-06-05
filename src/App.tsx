import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeSync } from "@/components/app/ThemeSync";

import SiteLayout from "@/components/layout/SiteLayout";
import AppLayout from "@/components/layout/AppLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/app/Dashboard";
import Maquinas from "./pages/app/Maquinas";
import Ubicaciones from "./pages/app/Ubicaciones";
import Finanzas from "./pages/app/Finanzas";
import Configuracion from "./pages/app/Configuracion";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeSync />
          <Routes>
            {/* Landing single-page */}
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Index />} />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
