import { cn } from "@/lib/utils";

type Variant = "gradient" | "green" | "mono" | "white";

interface ChipLogoProps {
  variant?: Variant;
  className?: string;
  /**
   * Tamaño en px. Si no se pasa, se controla con `className` (ej. w-12 h-12).
   */
  size?: number;
  title?: string;
}

/**
 * Isotipo Núcleo — chip 110×110, 12 pines, núcleo central 30×30 r8.
 * Geometría idéntica al manual de marca (src/assets/brand/).
 */
export function ChipLogo({
  variant = "gradient",
  className,
  size,
  title = "VendAI",
}: ChipLogoProps) {
  const uid = `chip-${variant}-${Math.random().toString(36).slice(2, 8)}`;
  const gradId = `g-${uid}`;

  const useGradient = variant === "gradient" || variant === "green";
  const stops =
    variant === "green"
      ? [
          { o: "0", c: "#1FB6E8" },
          { o: ".5", c: "#19D2BC" },
          { o: "1", c: "#16D399" },
        ]
      : [
          { o: "0", c: "#2B7FF5" },
          { o: ".52", c: "#1FB6E8" },
          { o: "1", c: "#46E4CF" },
        ];

  const strokeColor = useGradient
    ? `url(#${gradId})`
    : variant === "white"
    ? "#FFFFFF"
    : "currentColor";
  const fillColor = strokeColor;

  return (
    <svg
      viewBox="0 0 110 110"
      width={size}
      height={size}
      className={cn("inline-block", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {useGradient && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
            {stops.map((s) => (
              <stop key={s.o} offset={s.o} stopColor={s.c} />
            ))}
          </linearGradient>
        </defs>
      )}
      <g stroke={strokeColor} strokeWidth="7" strokeLinecap="round" fill="none">
        {/* pines superiores */}
        <line x1="30" y1="6" x2="30" y2="20" />
        <line x1="55" y1="6" x2="55" y2="20" />
        <line x1="80" y1="6" x2="80" y2="20" />
        {/* pines inferiores */}
        <line x1="30" y1="90" x2="30" y2="104" />
        <line x1="55" y1="90" x2="55" y2="104" />
        <line x1="80" y1="90" x2="80" y2="104" />
        {/* pines izquierdos */}
        <line x1="6" y1="30" x2="20" y2="30" />
        <line x1="6" y1="55" x2="20" y2="55" />
        <line x1="6" y1="80" x2="20" y2="80" />
        {/* pines derechos */}
        <line x1="90" y1="30" x2="104" y2="30" />
        <line x1="90" y1="55" x2="104" y2="55" />
        <line x1="90" y1="80" x2="104" y2="80" />
        {/* núcleo */}
        <rect x="20" y="20" width="70" height="70" rx="16" />
      </g>
      <rect x="40" y="40" width="30" height="30" rx="8" fill={fillColor} />
    </svg>
  );
}
