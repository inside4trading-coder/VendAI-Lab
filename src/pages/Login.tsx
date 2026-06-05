import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ChipLogo } from "@/components/brand/ChipLogo";
import { Logo } from "@/components/brand/Logo";
import { Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    document.title = "Acceder · VendAI";
    if (!authLoading && user) navigate("/app/dashboard", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: "No pudimos iniciarte sesión",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    navigate("/app/dashboard", { replace: true });
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app/dashboard",
    });
    if (result.redirected) return;
    if (result.error) {
      setGoogleLoading(false);
      toast({
        title: "No pudimos iniciar sesión con Google",
        description: (result.error as Error).message,
        variant: "destructive",
      });
      return;
    }
    navigate("/app/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0E1116] px-4 py-10">
      {/* Backdrop chip */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
        <ChipLogo variant="white" size={760} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(26,140,255,0.18),transparent_60%)]" />

      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#11151C]/90 backdrop-blur-xl shadow-[0_24px_70px_-20px_rgba(0,0,0,0.6)] p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <Logo size={32} tone="white" />
          <h1 className="mt-6 text-[20px] font-mono font-semibold tracking-tight text-white">
            Acceder al backoffice
          </h1>
          <p className="mt-1.5 font-mono text-[11px] tracking-[0.16em] uppercase text-white/40">
            VendAI · Lab
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-[#0E1116] font-mono text-[13px] tracking-[0.04em] rounded-xl py-3 hover:bg-white/90 active:bg-white/85 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
          )}
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/35">o</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] tracking-[0.14em] uppercase text-white/55 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:border-signal-blue/60 focus:ring-2 focus:ring-signal-blue/20 transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] tracking-[0.14em] uppercase text-white/55 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:border-signal-blue/60 focus:ring-2 focus:ring-signal-blue/20 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-signal text-white font-mono text-[13px] tracking-[0.08em] uppercase rounded-xl py-3.5 hover:opacity-95 active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Iniciar sesión
          </button>

          <div className="text-center pt-2">
            <Link
              to="#"
              className="font-mono text-[11.5px] tracking-[0.06em] text-white/50 hover:text-white/80 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link
            to="/"
            className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-white/35 hover:text-white/70 transition-colors"
          >
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
