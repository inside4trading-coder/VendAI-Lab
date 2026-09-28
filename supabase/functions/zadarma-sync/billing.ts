// Cruce de la facturación de Zadarma (/v1/statistics/) con las llamadas de la centralita
// (/v1/statistics/pbx/). Los dos endpoints usan ids distintos y su `sip` tampoco coincide
// (facturación trae el login SIP de la cuenta, la centralita la extensión), así que se
// emparejan por número y hora de inicio. Sin dependencias de Deno para testearlo con vitest.

export interface BillingEntry {
  id?: unknown;
  sip?: unknown; // login SIP de la cuenta, no la extensión: no sirve para cruzar
  callstart?: unknown;
  from?: unknown;
  to?: unknown;
  cost?: unknown;
  billcost?: unknown;
  currency?: unknown;
}

export interface PbxCallKey {
  callId: string;
  callstart: string; // "YYYY-MM-DD HH:MM:SS", misma zona horaria que la facturación
  destination: string;
  caller: string;
}

export interface BillingMatch {
  cost: number;
  currency: string | null;
}

/** Diferencia máxima entre el inicio en la centralita y en la facturación. */
const MAX_START_DIFF_SECONDS = 60;
/** Por debajo de esta longitud un número es una extensión interna: solo vale igualdad exacta. */
const MIN_EXTERNAL_NUMBER_DIGITS = 7;

const digits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * `billcost` es lo cobrado por la llamada; `cost` es la tarifa por minuto y solo se usa si
 * `billcost` no viene (una llamada fallida trae billcost 0 pero tarifa > 0).
 */
export function billingCost(entry: BillingEntry): number {
  const hasBillcost = entry.billcost !== undefined && entry.billcost !== null && entry.billcost !== "";
  return toNumber(hasBillcost ? entry.billcost : entry.cost);
}

function toEpochSeconds(value: unknown): number | null {
  const match = String(value ?? "").trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match.map(Number);
  return Date.UTC(y, mo - 1, d, h, mi, s) / 1000;
}

function sameNumber(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= MIN_EXTERNAL_NUMBER_DIGITS && long.endsWith(short);
}

/** Devuelve coste y moneda por `callId`. Cada entrada de facturación se usa como mucho una vez. */
export function matchBillingToCalls(calls: PbxCallKey[], billing: BillingEntry[]): Map<string, BillingMatch> {
  const pairs: Array<{ callId: string; entryIndex: number; diff: number }> = [];

  billing.forEach((entry, entryIndex) => {
    if (billingCost(entry) <= 0) return;
    const entryStart = toEpochSeconds(entry.callstart);
    if (entryStart === null) return;
    const to = digits(entry.to);
    const from = digits(entry.from);

    for (const call of calls) {
      const callStart = toEpochSeconds(call.callstart);
      if (callStart === null) continue;
      const diff = Math.abs(callStart - entryStart);
      if (diff > MAX_START_DIFF_SECONDS) continue;
      const numberMatches =
        sameNumber(digits(call.destination), to) || sameNumber(digits(call.caller), from);
      if (numberMatches) pairs.push({ callId: call.callId, entryIndex, diff });
    }
  });

  pairs.sort((a, b) => a.diff - b.diff);

  const result = new Map<string, BillingMatch>();
  const usedEntries = new Set<number>();
  for (const { callId, entryIndex } of pairs) {
    if (result.has(callId) || usedEntries.has(entryIndex)) continue;
    const entry = billing[entryIndex];
    const currency = typeof entry.currency === "string" && entry.currency ? entry.currency.toUpperCase() : null;
    result.set(callId, { cost: billingCost(entry), currency });
    usedEntries.add(entryIndex);
  }
  return result;
}
