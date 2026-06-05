import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title?: string;
  description?: string;
  kicker: string;
}

export function EmptyState({
  icon: Icon,
  kicker,
  title = "Próximamente",
  description = "Esta sección está en desarrollo.",
}: Props) {
  return (
    <section className="container py-10">
      <div className="mb-8">
        <span className="eyebrow">{kicker}</span>
      </div>
      <div className="panel min-h-[480px] flex flex-col items-center justify-center gap-5 text-center p-12">
        <div className="h-20 w-20 rounded-full bg-line/60 flex items-center justify-center">
          <Icon className="h-9 w-9 text-faint" strokeWidth={1.5} />
        </div>
        <h2 className="text-[26px] font-semibold tracking-tight text-ink">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
    </section>
  );
}
