import { ChipLogo } from "@/components/brand/ChipLogo";

interface PlaceholderProps {
  title: string;
  kicker: string;
  description: string;
}

export function Placeholder({ title, kicker, description }: PlaceholderProps) {
  return (
    <section className="container py-16">
      <div className="flex items-baseline gap-4 mb-12">
        <span className="font-mono text-xs text-faint">— 00</span>
        <div>
          <span className="eyebrow">{kicker}</span>
          <h1 className="mt-3 text-[clamp(28px,4vw,46px)] leading-tight tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      <p className="text-[clamp(17px,1.6vw,20px)] leading-relaxed text-ink-2 max-w-2xl mb-12">
        {description}
      </p>

      <div className="panel min-h-[320px] flex flex-col items-center justify-center gap-4 text-center p-10">
        <ChipLogo variant="gradient" size={56} />
        <p className="eyebrow">Sección en construcción</p>
        <p className="text-sm text-muted-foreground max-w-md">
          El contenido real llega en la siguiente fase. Aquí vivirá la
          experiencia de {title.toLowerCase()}.
        </p>
      </div>
    </section>
  );
}
