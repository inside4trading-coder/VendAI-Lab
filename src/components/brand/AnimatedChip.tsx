import { Suspense, lazy, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChipLogo } from "./ChipLogo";

const VendaiVendingLogo = lazy(() =>
  import("./VendaiVendingLogo").then((m) => ({ default: m.VendaiVendingLogo }))
);

interface AnimatedChipProps {
  className?: string;
  size?: number;
  title?: string;
}

/**
 * Isotipo animado de VendAI — máquina de vending 3D (react-three-fiber).
 * Fallback a SVG estático cuando `prefers-reduced-motion: reduce`.
 */
export function AnimatedChip({
  className,
  size,
  title = "VendAI",
}: AnimatedChipProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const dim = size ? { width: size, height: size } : undefined;

  if (reduced) {
    return (
      <ChipLogo
        variant="gradient"
        size={size}
        className={className}
        title={title}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${title} — máquina de vending`}
      className={cn("relative aspect-square select-none", className)}
      style={dim}
    >
      <Suspense
        fallback={
          <ChipLogo
            variant="gradient"
            className="h-full w-full"
            title={title}
          />
        }
      >
        <VendaiVendingLogo />
      </Suspense>
    </div>
  );
}
