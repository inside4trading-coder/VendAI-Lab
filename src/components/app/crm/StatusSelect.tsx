import { LEAD_STATUSES, statusStyles } from "@/lib/crm";

interface Props {
  value: string;
  onChange: (s: string) => void;
  className?: string;
}

export function StatusSelect({ value, onChange, className = "" }: Props) {
  const st = statusStyles[value] ?? statusStyles.Nuevo;
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none cursor-pointer font-mono text-[11.5px] tracking-[0.04em] rounded-full pl-6 pr-7 py-1 border-0 ${st.badge} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-paper focus:${st.ring}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='currentColor' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.6rem center",
        }}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${st.dot}`}
      />
    </div>
  );
}
