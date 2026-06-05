import { DISCOVERY_QUESTIONS, type LeadDiscovery } from "@/lib/crm";

export function discoveryCount(d: LeadDiscovery | null | undefined): number {
  if (!d) return 0;
  return DISCOVERY_QUESTIONS.reduce((acc, q) => {
    const v = d[q.key];
    return acc + (v && String(v).trim() !== "" ? 1 : 0);
  }, 0);
}

interface Props {
  discovery: LeadDiscovery | null | undefined;
  variant?: "pill" | "dots" | "inline";
  className?: string;
}

export function DiscoveryProgress({ discovery, variant = "pill", className = "" }: Props) {
  const total = DISCOVERY_QUESTIONS.length;
  const done = discoveryCount(discovery);
  const tone =
    done === 0
      ? "text-faint"
      : done < 3
        ? "text-muted-foreground"
        : done < total
          ? "text-signal-blue"
          : "text-crypto-green";

  if (variant === "dots") {
    return (
      <span
        className={`inline-flex items-center gap-0.5 ${className}`}
        title={`Discovery ${done}/${total}`}
        aria-label={`Discovery ${done} de ${total}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i < done ? "bg-current" : "bg-line"} ${i < done ? tone : ""}`}
          />
        ))}
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${tone} ${className}`}
        title="Preguntas del discovery respondidas"
      >
        <DiscoveryProgress discovery={discovery} variant="dots" />
        <span>
          {done}/{total}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.06em] uppercase ${tone} bg-panel border border-line rounded-full px-2 py-0.5 ${className}`}
      title="Discovery completado"
    >
      <DiscoveryProgress discovery={discovery} variant="dots" />
      <span>
        {done}/{total}
      </span>
    </span>
  );
}
