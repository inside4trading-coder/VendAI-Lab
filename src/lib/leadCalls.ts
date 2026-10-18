interface SummarizableCall {
  call_start: string | null;
  status: string | null;
  talk_duration: number;
  cost: number;
  cost_currency: string | null;
}

export interface LeadCallsSummary {
  total: number;
  answered: number;
  talkMinutes: number;
  lastCallAt: string | null;
  totalCost: number;
  costCurrency: string | null;
}

/** Cabecera de la pestaña Llamadas en la ficha del lead. */
export function summarizeLeadCalls(calls: SummarizableCall[]): LeadCallsSummary {
  const talkSeconds = calls.reduce((s, c) => s + (Number(c.talk_duration) || 0), 0);
  const cost = calls.reduce((s, c) => s + (Number(c.cost) || 0), 0);
  const starts = calls.map((c) => c.call_start).filter((d): d is string => Boolean(d));
  return {
    total: calls.length,
    answered: calls.filter((c) => c.status === "answered").length,
    talkMinutes: Math.round(talkSeconds / 60),
    lastCallAt: starts.length ? starts.reduce((a, b) => (a > b ? a : b)) : null,
    totalCost: Math.round(cost * 100) / 100,
    costCurrency: calls.find((c) => c.cost_currency)?.cost_currency ?? null,
  };
}
