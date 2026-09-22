import { Phone, Star } from "lucide-react";
import type { Lead, TeamMember } from "@/lib/crm";
import { teamMemberLabel } from "@/lib/crm";
import { StatusBadge } from "./StatusBadge";
import { DiscoveryProgress } from "./DiscoveryProgress";

interface Props {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
  teamMembers?: TeamMember[];
}

export function LeadsTable({ leads, onOpen, teamMembers = [] }: Props) {
  return (
    <div className="bg-paper border border-line rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-[14px]">
          <thead>
            <tr className="border-b border-line bg-panel/50">
              {[
                "Nombre",
                "Categoría",
                "Dirección",
                "Teléfono",
                "Rating",
                "Estado",
                "Discovery",
                "Próx. acción",
                "Asignado",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left font-mono text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const next = l.next_action_at
                ? new Intl.DateTimeFormat("es-ES", {
                    day: "2-digit",
                    month: "short",
                  }).format(new Date(l.next_action_at))
                : null;
              return (
                <tr
                  key={l.id}
                  onClick={() => onOpen(l)}
                  className="border-b border-line/70 last:border-0 hover:bg-panel/60 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5 text-ink font-medium">{l.name}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{l.category}</td>
                  <td className="px-4 py-3.5 text-muted-foreground max-w-[260px] truncate">
                    {l.address ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    {l.phone ? (
                      <a
                        href={`tel:${l.phone.replace(/\s/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 font-mono text-[13px] text-ink hover:text-signal-blue transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {l.phone}
                      </a>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {l.rating && l.rating > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[13px] text-ink">
                        <Star
                          className="h-3.5 w-3.5 text-amber-400"
                          fill="currentColor"
                          strokeWidth={0}
                        />
                        {Number(l.rating).toFixed(1)}
                      </span>
                    ) : (
                      <span className="font-mono text-[13px] text-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <DiscoveryProgress discovery={l.discovery} variant="inline" />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-2">
                    {next ?? <span className="text-faint">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {(() => {
                      const member = l.assigned_to
                        ? teamMembers.find((m) => m.id === l.assigned_to)
                        : null;
                      const label = member ? teamMemberLabel(member) : l.owner_name;
                      return label ?? "—";
                    })()}
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  No hay resultados con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
