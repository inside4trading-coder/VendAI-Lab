import { cn } from "@/lib/utils";

type Tone = "default" | "white" | "mono" | "on-dark";

interface WordmarkProps {
  tone?: Tone;
  className?: string;
}

/**
 * Wordmark VendAI: "Vend" en contorno + "AI" en sólido con degradado signal.
 * Las proporciones y pesos son intencionales — no alterar.
 */
export function Wordmark({ tone = "default", className }: WordmarkProps) {
  return (
    <span className={cn("wm", tone !== "default" && tone, className)}>
      <span className="vend">Vend</span>
      <span className="ai">AI</span>
    </span>
  );
}
