import { useEffect } from "react";
import { usePreferences } from "@/hooks/settings/useSettings";

// El modo oscuro está a medias: los tokens de marca (paper/ink/line/panel) no se
// remapean en .dark y el texto queda blanco sobre fondo blanco. Hasta completarlo,
// "system" no sigue al SO (siempre claro); solo "dark" explícito activa .dark.
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
