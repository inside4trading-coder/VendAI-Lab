import { machineStatusStyles } from "@/lib/machines";

export function MachineStatusBadge({ status }: { status: string }) {
  const st = machineStatusStyles[status] ?? machineStatusStyles.Inactiva;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] px-2.5 py-1 rounded-full ${st.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
      {status}
    </span>
  );
}
