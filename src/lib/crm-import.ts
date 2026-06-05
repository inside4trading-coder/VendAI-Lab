import * as XLSX from "xlsx";
import { LEAD_CATEGORIES, type LeadCategory, type LeadDiscovery } from "@/lib/crm";

export interface ImportedLead {
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  status: string;
  owner_name: string | null;
  notes: string | null;
  discovery: LeadDiscovery;
}


export interface ParsedSheet {
  sheetName: string;
  rows: ImportedLead[];
  skipped: number;
}

const normalize = (s: string) =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const FIELD_ALIASES: Record<"name" | "category" | "address" | "phone" | "email" | "website" | "rating", string[]> = {
  name: ["negocio", "nombre", "name", "empresa"],
  category: ["categoria", "category", "tipo"],
  address: ["direccion", "address", "domicilio"],
  phone: ["telefono", "phone", "whatsapp", "movil"],
  email: ["email", "correo", "mail"],
  website: ["web", "website", "sitio web", "url"],
  rating: ["rating", "valoracion", "puntuacion"],
};

const DISCOVERY_ALIASES: Record<keyof LeadDiscovery, string[]> = {
  vending: ["p1", "vending"],
  traffic: ["p2", "personas", "trafico"],
  space: ["p3", "espacio", "toma de corriente"],
  decision_maker: ["p4", "decide", "decisor"],
  open_proposal: ["p5", "propuesta", "abiertos"],
};

const EXTRA_NOTE_KEYS = [
  "ciudad",
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "reviews",
];

function findValue(row: Record<string, unknown>, aliases: string[]): unknown {
  for (const key of Object.keys(row)) {
    const n = normalize(key);
    if (aliases.some((a) => n === a || n.startsWith(a))) {
      const v = row[key];
      if (v !== null && v !== undefined && String(v).trim() !== "") return v;
    }
  }
  return null;
}

function cleanString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s === "S/N" || s === "-" ? null : s;
}

function cleanPhone(v: unknown): string | null {
  const s = cleanString(v);
  if (!s) return null;
  // Si parece fecha numérica (>8 dígitos sin espacios y empieza por 20…) descartar
  if (/^\d{8,}$/.test(s) && s.startsWith("20")) return null;
  return s;
}

function cleanRating(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function mapCategory(raw: string | null): string {
  if (!raw) return "Otros";
  const n = normalize(raw);
  const found = LEAD_CATEGORIES.find((c) => normalize(c) === n);
  return (found as LeadCategory) ?? raw;
}

function buildNotes(row: Record<string, unknown>, sheetName: string): string | null {
  const callNote =
    cleanString(findValue(row, ["notas de llamada", "notas", "notes"])) ?? null;
  const extras: string[] = [];
  extras.push(`Origen: ${sheetName}`);
  for (const key of Object.keys(row)) {
    const n = normalize(key);
    if (EXTRA_NOTE_KEYS.some((k) => n.startsWith(k))) {
      const v = cleanString(row[key]);
      if (v) extras.push(`${key.trim()}: ${v}`);
    }
  }
  const parts = [callNote, extras.join(" · ")].filter(Boolean);
  return parts.length ? parts.join("\n\n") : null;
}

function extractDiscovery(row: Record<string, unknown>): LeadDiscovery {
  const out: LeadDiscovery = {};
  (Object.keys(DISCOVERY_ALIASES) as (keyof LeadDiscovery)[]).forEach((k) => {
    const v = cleanString(findValue(row, DISCOVERY_ALIASES[k]));
    if (v) out[k] = v;
  });
  return out;
}


export function mapRowToLead(
  row: Record<string, unknown>,
  sheetName: string,
): ImportedLead | null {
  const name = cleanString(findValue(row, FIELD_ALIASES.name));
  if (!name) return null;
  return {
    name,
    category: mapCategory(cleanString(findValue(row, FIELD_ALIASES.category))),
    address: cleanString(findValue(row, FIELD_ALIASES.address)),
    phone: cleanPhone(findValue(row, FIELD_ALIASES.phone)),
    email: cleanString(findValue(row, FIELD_ALIASES.email)),
    website: cleanString(findValue(row, FIELD_ALIASES.website)),
    rating: cleanRating(findValue(row, FIELD_ALIASES.rating)),
    status: "Nuevo",
    owner_name: null,
    notes: buildNotes(row, sheetName),
    discovery: extractDiscovery(row),
  };
}

export async function parseWorkbook(file: File): Promise<ParsedSheet[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  return wb.SheetNames.map((sheetName) => {
    const ws = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: null,
      raw: true,
    });
    const rows: ImportedLead[] = [];
    let skipped = 0;
    for (const r of json) {
      const mapped = mapRowToLead(r, sheetName);
      if (mapped) rows.push(mapped);
      else skipped++;
    }
    return { sheetName, rows, skipped };
  });
}
