import { useEffect } from "react";
import { usePreferences } from "@/hooks/settings/useSettings";

// "system" no sigue al SO (siempre claro) hasta validar visualmente el modo oscuro
// en todas las pantallas; solo "dark" explícito activa .dark.
function applyTheme(theme: "light" | "dark" | "system") {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeSync() {
  const { data: prefs } = usePreferences();
  useEffect(() => {
    if (!prefs) return;
    applyTheme(prefs.theme);
  }, [prefs?.theme]);
  return null;
}
