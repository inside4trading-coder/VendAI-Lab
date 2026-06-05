import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  num: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  num,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-baseline gap-4",
          align === "center" && "justify-center",
        )}
      >
        <span className="font-mono text-[12px] text-faint tracking-[0.04em]">
          — {num}
        </span>
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="text-[clamp(30px,4.4vw,50px)] leading-[1.05] tracking-[-0.03em] text-ink max-w-3xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-[clamp(16px,1.4vw,20px)] leading-relaxed text-ink-2 max-w-2xl mt-1",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
