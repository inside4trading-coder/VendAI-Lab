export const LEAD_STATUSES = [
  "Nuevo",
  "Contactado",
  "Reunión Agendada",
  "Negociación",
  "Ganado",
  "Descartado",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_CATEGORIES = ["Gimnasios", "Hoteles", "Oficinas", "Otros"] as const;
export type LeadCategory = (typeof LEAD_CATEGORIES)[number];

export const ACTIVITY_TYPES = [
  "llamada",
  "email",
  "reunion",
  "nota",
  "cambio_estado",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface LeadDiscovery {
  vending?: string | null;
  traffic?: string | null;
  space?: string | null;
  decision_maker?: string | null;
  open_proposal?: string | null;
  [key: string]: string | null | undefined;
}


export const DISCOVERY_QUESTIONS: { key: keyof LeadDiscovery; label: string; question: string }[] = [
  {
    key: "vending",
    label: "P1 · Vending actual",
    question: "¿Tienen actualmente alguna máquina de vending o servicio de snacks y bebidas?",
  },
  {
    key: "traffic",
    label: "P2 · Tráfico",
    question: "¿Cuántas personas pasan por sus instalaciones al día aproximadamente?",
  },
  {
    key: "space",
    label: "P3 · Espacio",
    question: "¿Tienen un espacio disponible con toma de corriente donde pudiera instalarse una máquina?",
  },
  {
    key: "decision_maker",
    label: "P4 · Decisor",
    question: "¿Usted sería la persona indicada para evaluar la propuesta o habría alguien más involucrado?",
  },
  {
    key: "open_proposal",
    label: "P5 · Apertura",
    question: "¿Estarían abiertos a escuchar una propuesta sin coste para el establecimiento?",
  },
];

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  status: string;
  owner_name: string | null;
  assigned_to: string | null;
  tags: string[];
  next_action_at: string | null;
  next_action_note: string | null;
  notes: string | null;
  discovery: LeadDiscovery;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
}

export function teamMemberLabel(m: Pick<TeamMember, "full_name" | "email">): string {
  return m.full_name || m.email;
}

/** Semáforo de la próxima acción: vencida / próxima (≤2 días) / futura / sin fecha. */
export type NextActionTone = "overdue" | "soon" | "future" | "none";

export function getNextActionTone(dateStr: string | null | undefined): NextActionTone {
  if (!dateStr) return "none";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  if (d.getTime() <= today.getTime() + dayMs - 1) return "overdue";
  if (d.getTime() <= today.getTime() + 3 * dayMs) return "soon";
  return "future";
}

export const nextActionToneStyles: Record<NextActionTone, string> = {
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  soon: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  future: "bg-crypto-green/10 text-crypto-green border-crypto-green/30",
  none: "bg-panel text-ink-2 border-line",
};


export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  occurred_at: string;
  created_at: string;
}

export const statusStyles: Record<
  string,
  { dot: string; badge: string; col: string; ring: string }
> = {
  Nuevo: {
    dot: "bg-muted-ink",
    badge: "bg-muted-ink/12 text-ink-2",
    col: "border-t-muted-ink",
    ring: "ring-muted-ink/30",
  },
  Contactado: {
    dot: "bg-signal-blue",
    badge: "bg-signal-blue/12 text-signal-blue",
    col: "border-t-signal-blue",
    ring: "ring-signal-blue/30",
  },
  "Reunión Agendada": {
    dot: "bg-ventures-violet",
    badge: "bg-ventures-violet/12 text-ventures-violet",
    col: "border-t-ventures-violet",
    ring: "ring-ventures-violet/30",
  },
  Negociación: {
    dot: "bg-cyan",
    badge: "bg-cyan/12 text-cyan",
    col: "border-t-cyan",
    ring: "ring-cyan/30",
  },
  Ganado: {
    dot: "bg-crypto-green",
    badge: "bg-crypto-green/12 text-crypto-green",
    col: "border-t-crypto-green",
    ring: "ring-crypto-green/30",
  },
  Descartado: {
    dot: "bg-destructive",
    badge: "bg-destructive/12 text-destructive",
    col: "border-t-destructive",
    ring: "ring-destructive/30",
  },
};

export const SEED_LEADS: Omit<
  Lead,
  "id" | "user_id" | "created_at" | "updated_at" | "email" | "website" | "next_action_at" | "next_action_note" | "notes" | "discovery" | "assigned_to" | "tags"
>[] = [
  { name: "Infinito Gimnasio Femenino", category: "Gimnasios", address: "C. de las Pedroñeras, 1, Hortaleza, Madrid", phone: "691 11 74 51", rating: 5.0, status: "Reunión Agendada", owner_name: "Andrés" },
  { name: "We/On Palacio de Hielo", category: "Gimnasios", address: "C. de Silvano, 77, Hortaleza, Madrid", phone: "917 16 23 00", rating: 4.0, status: "Nuevo", owner_name: "Andrés" },
  { name: "Blue Gym Arturo Soria", category: "Gimnasios", address: "C. de Vicente Muzas, 6, Madrid", phone: "617 34 06 18", rating: 4.4, status: "Contactado", owner_name: "Andrés" },
  { name: "Hotel Best Osuna Madrid", category: "Hoteles", address: "C/ de Luis de la Mata, 18, Hortaleza, Madrid", phone: "917 41 81 00", rating: 3.6, status: "Contactado", owner_name: "Andrés" },
  { name: "MaxGym", category: "Gimnasios", address: "Av. de los Prunos, 98, Hortaleza, Madrid", phone: "06 37378347", rating: null, status: "Reunión Agendada", owner_name: "Andrés" },
  { name: "AQA Los Prunos", category: "Gimnasios", address: "Av. de los Prunos, 98, Hortaleza, Madrid", phone: "917 43 20 01", rating: 3.8, status: "Reunión Agendada", owner_name: "Andrés" },
  { name: "Hotel Zenit Conde Orgaz", category: "Hoteles", address: "C. del Moscatelar, 24, Hortaleza, Madrid", phone: "917 48 97 60", rating: 4.2, status: "Nuevo", owner_name: "Andrés" },
  { name: "Anytime Fitness Hortaleza", category: "Gimnasios", address: "C. de Mota del Cuervo, 30, Hortaleza, Madrid", phone: "689 66 71 32", rating: 4.0, status: "Reunión Agendada", owner_name: "Andrés" },
  { name: "New Hortaleza Coliving", category: "Hoteles", address: "C. del Santo Ángel, 88, Hortaleza, Madrid", phone: "641 21 06 38", rating: 3.9, status: "Reunión Agendada", owner_name: "Andrés" },
  { name: "Hotel Mirador de Chamartin", category: "Hoteles", address: "C/ del Arte, 14, Madrid", phone: "917 68 01 41", rating: 4.1, status: "Contactado", owner_name: "Andrés" },
];
