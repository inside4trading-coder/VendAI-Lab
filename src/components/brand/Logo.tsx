import { cn } from "@/lib/utils";
import { ChipLogo } from "./ChipLogo";
import { Wordmark } from "./Wordmark";

interface LogoProps {
  /** Tamaño del isotipo en px (también escala el wordmark) */
  size?: number;
  tone?: "default" | "white" | "mono";
  iconOnly?: boolean;
  className?: string;
}

/**
 * Lockup principal: isotipo Núcleo + wordmark VendAI.
 */
export function Logo({
  size = 36,
  tone = "default",
  iconOnly = false,
  className,
}: LogoProps) {
  const chipVariant =
    tone === "white" ? "white" : tone === "mono" ? "mono" : "gradient";
  const wmTone =
    tone === "white" ? "white" : tone === "mono" ? "mono" : "default";

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="VendAI"
      style={{ fontSize: size * 0.78 }}
    >
      <ChipLogo variant={chipVariant} size={size} />
      {!iconOnly && <Wordmark tone={wmTone} />}
    </span>
  );
}
