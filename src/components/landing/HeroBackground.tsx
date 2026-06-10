import { Suspense, lazy, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const NeuralField = lazy(() => import("./three/NeuralField"));

/**
 * Fondo 3D del hero con carga diferida. En móvil, con prefers-reduced-motion
 * o sin WebGL no se monta nada: la aura de gradiente del hero queda como
 * fallback estático.
 */
export function HeroBackground() {
  const isMobile = useIsMobile();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (gl) setEnabled(true);
  }, []);

  if (isMobile || !enabled) return null;

  return (
    <Suspense fallback={null}>
      <NeuralField />
    </Suspense>
  );
}
