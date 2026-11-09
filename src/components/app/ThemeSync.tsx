import { useEffect } from "react";
import { usePreferences } from "@/hooks/settings/useSettings";

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  root.classList.toggle("dark", resolved === "dark");
}

export function ThemeSync() {
  const { data: prefs } = usePreferences();
  useEffect(() => {
    if (!prefs) return;
    applyTheme(prefs.theme);
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [prefs?.theme]);
  return null;
}
