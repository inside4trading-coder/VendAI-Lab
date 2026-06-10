import { ReactNode } from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "header";
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Wrapper de entrada fade-up cuando entra en viewport (framer-motion).
 * Requiere <LazyMotion> en un ancestro (ver SiteLayout).
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Tag = m[as];
  return (
    <Tag
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px", amount: 0.12 }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: EASE_OUT_EXPO }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </Tag>
  );
}
