import { useEffect, useRef, useState } from "react";

interface AnimatedValueProps {
  /** Valor final, p. ej. "15.000€", "30-50%", "12-18" */
  value: string;
  duration?: number;
  className?: string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Contador animado: anima cada número del string al entrar en viewport,
 * conservando sufijos/separadores ("15.000€" → 0…15.000€).
 * Con prefers-reduced-motion muestra el valor final directamente.
 */
export function AnimatedValue({ value, duration = 1400, className }: AnimatedValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let raf = 0;
    let started = false;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        obs.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          setProgress(easeOutCubic(p));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration]);

  const text = value.replace(/\d[\d.]*/g, (token) => {
    const target = parseInt(token.replace(/\./g, ""), 10);
    const current = Math.round(target * progress);
    return token.includes(".") ? current.toLocaleString("es-ES") : String(current);
  });

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {text}
    </span>
  );
}
