export type LedgerKind = "ingreso" | "egreso";
export type LedgerCurrency = "USD" | "EUR";

export interface LedgerMovement {
  id: string;
  occurred_on: string; // YYYY-MM-DD
  member_id: string | null;
  kind: LedgerKind;
  description: string;
  currency: LedgerCurrency;
  amount: number;
  created_at: string;
}

export interface LedgerRow extends LedgerMovement {
  amountUsd: number;
  balanceUsd: number;
}

export interface LedgerTotals {
  incomeUsd: number;
  expenseUsd: number;
  balanceUsd: number;
}

export interface MemberSummary extends LedgerTotals {
  memberId: string | null;
  /** % de los ingresos totales aportado por el miembro. */
  incomeShare: number;
}

export const DEFAULT_EUR_USD_RATE = 1.08;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Igual que la hoja: el balance siempre en USD, EUR convertido con el tipo de cambio actual. */
export function toUsd(amount: number, currency: LedgerCurrency, eurUsdRate: number): number {
  return currency === "EUR" ? amount * eurUsdRate : amount;
}

const signedUsd = (m: LedgerMovement, rate: number) =>
  (m.kind === "ingreso" ? 1 : -1) * toUsd(Number(m.amount) || 0, m.currency, rate);

function sortChronologically(movements: LedgerMovement[]): LedgerMovement[] {
  return [...movements].sort(
    (a, b) => a.occurred_on.localeCompare(b.occurred_on) || a.created_at.localeCompare(b.created_at),
  );
}

function totalsOf(movements: LedgerMovement[], rate: number): LedgerTotals {
  const incomeUsd = movements
    .filter((m) => m.kind === "ingreso")
    .reduce((s, m) => s + toUsd(Number(m.amount) || 0, m.currency, rate), 0);
  const expenseUsd = movements
    .filter((m) => m.kind === "egreso")
    .reduce((s, m) => s + toUsd(Number(m.amount) || 0, m.currency, rate), 0);
  return {
    incomeUsd: round2(incomeUsd),
    expenseUsd: round2(expenseUsd),
    balanceUsd: round2(incomeUsd - expenseUsd),
  };
}

/** Movimientos en orden cronológico con saldo acumulado en USD (hoja "Movimientos"). */
export function buildLedger(
  movements: LedgerMovement[],
  eurUsdRate: number,
): { rows: LedgerRow[]; totals: LedgerTotals } {
  let running = 0;
  const rows = sortChronologically(movements).map((m) => {
    const amountUsd = toUsd(Number(m.amount) || 0, m.currency, eurUsdRate);
    running += signedUsd(m, eurUsdRate);
    return { ...m, amountUsd: round2(amountUsd), balanceUsd: round2(running) };
  });
  return { rows, totals: totalsOf(movements, eurUsdRate) };
}

/** Totales por miembro y % de ingresos (hoja "Resumen"). */
export function summarizeByMember(
  movements: LedgerMovement[],
  eurUsdRate: number,
  knownMemberIds: string[] = [],
): { members: MemberSummary[]; total: Omit<MemberSummary, "memberId"> } {
  const total = totalsOf(movements, eurUsdRate);
  const ids = new Set<string | null>([...knownMemberIds, ...movements.map((m) => m.member_id)]);
  const share = (income: number) => (total.incomeUsd > 0 ? round2((income / total.incomeUsd) * 100) : 0);

  const members = [...ids]
    .map((memberId) => {
      const t = totalsOf(
        movements.filter((m) => m.member_id === memberId),
        eurUsdRate,
      );
      return { memberId, ...t, incomeShare: share(t.incomeUsd) };
    })
    .sort((a, b) => {
      if (a.memberId === null) return 1;
      if (b.memberId === null) return -1;
      return a.memberId.localeCompare(b.memberId);
    });

  return {
    members,
    total: { ...total, incomeShare: total.incomeUsd > 0 ? 100 : 0 },
  };
}
