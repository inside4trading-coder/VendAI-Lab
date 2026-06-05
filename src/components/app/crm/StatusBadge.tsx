import { statusStyles } from "@/lib/crm";

export function StatusBadge({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const st = statusStyles[status] ?? statusStyles.Nuevo;
  const cls =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1"
      : "text-[11px] px-2.5 py-1 gap-1.5";
  return (
    <span
      className={`inline-flex items-center font-mono tracking-[0.04em] rounded-full ${st.badge} ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
      {status}
    </span>
  );
}
