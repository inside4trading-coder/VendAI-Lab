export type CallPeriod = "today" | "week" | "month" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CallRecord {
  id: string;
  call_id: string;
  pbx_call_id: string | null;
  call_start: string | null;
  call_end: string | null;
  caller: string | null;
  destination: string | null;
  direction: string | null;
  status: string | null;
  duration: number;
  talk_duration: number;
  sip: string | null;
  agent_name: string | null;
  cost: number;
  cost_currency: string | null;
  is_recorded: boolean;
  recording_url: string | null;
}

export interface CallKPIs {
  totalCalls: number;
  validCalls: number;
  answerRate: number;
  validRate: number;
  minutesTalked: number;
  totalCost: number;
  /** Moneda en la que factura Zadarma; null si aún no hay llamadas facturadas. */
  costCurrency: string | null;
}

export interface DailyData {
  date: string;
  total: number;
  answered: number;
  valid: number;
}

export interface HourlyData {
  hour: number;
  count: number;
}

export interface AgentData {
  agent: string;
  total: number;
  answered: number;
  missed: number;
  valid: number;
  minutes: number;
  avgDuration: number;
  validRate: number;
  answerRate: number;
  cost: number;
}

export interface CallsData {
  kpis: CallKPIs;
  dailyData: DailyData[];
  hourlyData: HourlyData[];
  agentData: AgentData[];
  /** Todas las llamadas del periodo, de más reciente a más antigua. */
  calls: CallRecord[];
}

export type CallStatusFilter = "all" | "answered" | "valid" | "no_answer" | "busy" | "missed";
export type CallDirectionFilter = "all" | "incoming" | "outgoing" | "internal";

export interface CallFilters {
  status: CallStatusFilter;
  direction: CallDirectionFilter;
}

/** Una llamada es "válida" si fue contestada y la conversación superó este umbral. */
const VALID_CALL_MIN_TALK_SECONDS = 30;
const DEFAULT_LOOKBACK_DAYS = 30;

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

function daysAgo(now: Date, days: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d;
}

export function getDateRange(
  period: CallPeriod,
  customRange?: DateRange,
  now: Date = new Date(),
): DateRange {
  switch (period) {
    case "today":
      return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: now };
    case "week":
      return { start: daysAgo(now, 7), end: now };
    case "custom":
      return customRange ?? { start: daysAgo(now, DEFAULT_LOOKBACK_DAYS), end: now };
    default:
      return { start: daysAgo(now, DEFAULT_LOOKBACK_DAYS), end: now };
  }
}

export function isValidCall(call: CallRecord): boolean {
  return call.status === "answered" && call.talk_duration > VALID_CALL_MIN_TALK_SECONDS;
}

const sumTalk = (calls: CallRecord[]) => calls.reduce((s, c) => s + (c.talk_duration || 0), 0);
const sumCost = (calls: CallRecord[]) => calls.reduce((s, c) => s + (Number(c.cost) || 0), 0);

function buildDailyData(records: CallRecord[]): DailyData[] {
  const byDay = new Map<string, DailyData>();
  for (const c of records) {
    const date = c.call_start?.slice(0, 10) || "unknown";
    const prev = byDay.get(date) ?? { date, total: 0, answered: 0, valid: 0 };
    byDay.set(date, {
      ...prev,
      total: prev.total + 1,
      answered: prev.answered + (c.status === "answered" ? 1 : 0),
      valid: prev.valid + (isValidCall(c) ? 1 : 0),
    });
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function buildHourlyData(records: CallRecord[]): HourlyData[] {
  const counts = Array.from({ length: 24 }, () => 0);
  for (const c of records) {
    if (c.call_start) counts[new Date(c.call_start).getHours()] += 1;
  }
  return counts.map((count, hour) => ({ hour, count }));
}

function buildAgentData(records: CallRecord[]): AgentData[] {
  const byAgent = new Map<string, CallRecord[]>();
  for (const c of records) {
    const agent = c.agent_name || c.sip || "Sin asignar";
    byAgent.set(agent, [...(byAgent.get(agent) ?? []), c]);
  }

  return [...byAgent.entries()]
    .map(([agent, calls]) => {
      const answered = calls.filter((c) => c.status === "answered").length;
      const valid = calls.filter(isValidCall).length;
      const talkMinutes = sumTalk(calls) / 60;
      return {
        agent,
        total: calls.length,
        answered,
        missed: calls.length - answered,
        valid,
        minutes: round1(talkMinutes),
        avgDuration: answered > 0 ? round1(talkMinutes / answered) : 0,
        validRate: Math.round(pct(valid, calls.length)),
        answerRate: Math.round(pct(answered, calls.length)),
        cost: round2(sumCost(calls)),
      };
    })
    .sort((a, b) => b.total - a.total);
}

/** Agrega llamadas (ordenadas de más reciente a más antigua) en KPIs y series para el panel. */
export function buildCallsData(records: CallRecord[]): CallsData {
  const totalCalls = records.length;
  const answered = records.filter((c) => c.status === "answered").length;
  const valid = records.filter(isValidCall).length;

  return {
    kpis: {
      totalCalls,
      validCalls: valid,
      answerRate: pct(answered, totalCalls),
      validRate: pct(valid, totalCalls),
      minutesTalked: Math.round(sumTalk(records) / 60),
      totalCost: round2(sumCost(records)),
      costCurrency: records.find((c) => c.cost_currency)?.cost_currency ?? null,
    },
    dailyData: buildDailyData(records),
    hourlyData: buildHourlyData(records),
    agentData: buildAgentData(records),
    calls: records,
  };
}

/** Filtra la lista de llamadas por estado ("valid" = contestada y > 30 s) y dirección. */
export function filterCalls(calls: CallRecord[], filters: CallFilters): CallRecord[] {
  return calls.filter((c) => {
    const statusOk =
      filters.status === "all" ||
      (filters.status === "valid" ? isValidCall(c) : c.status === filters.status);
    const directionOk = filters.direction === "all" || c.direction === filters.direction;
    return statusOk && directionOk;
  });
}
