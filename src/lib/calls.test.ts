import { describe, expect, it } from "vitest";
import { buildCallsData, filterCalls, getDateRange, isValidCall, type CallRecord } from "./calls";

function makeCall(overrides: Partial<CallRecord> = {}): CallRecord {
  return {
    id: crypto.randomUUID(),
    call_id: crypto.randomUUID(),
    pbx_call_id: "",
    call_start: "2026-09-20T10:15:00.000Z",
    call_end: null,
    caller: "600000000",
    destination: "100",
    direction: "outgoing",
    status: "answered",
    duration: 60,
    talk_duration: 60,
    sip: "100",
    agent_name: "Yannick",
    cost: 0.1,
    cost_currency: "USD",
    is_recorded: false,
    recording_url: null,
    ...overrides,
  };
}

describe("isValidCall", () => {
  it("counts answered calls longer than 30s as valid", () => {
    expect(isValidCall(makeCall({ talk_duration: 31 }))).toBe(true);
  });

  it("rejects answered calls of 30s or less", () => {
    expect(isValidCall(makeCall({ talk_duration: 30 }))).toBe(false);
  });

  it("rejects unanswered calls regardless of duration", () => {
    expect(isValidCall(makeCall({ status: "no_answer", talk_duration: 120 }))).toBe(false);
  });
});

describe("getDateRange", () => {
  const now = new Date("2026-09-28T15:00:00");

  it("starts today at local midnight", () => {
    const { start, end } = getDateRange("today", undefined, now);
    expect(start.getHours()).toBe(0);
    expect(start.getDate()).toBe(28);
    expect(end).toBe(now);
  });

  it("goes back 7 days for week", () => {
    expect(getDateRange("week", undefined, now).start.getDate()).toBe(21);
  });

  it("uses the custom range when provided", () => {
    const range = { start: new Date("2026-09-01"), end: new Date("2026-09-10") };
    expect(getDateRange("custom", range, now)).toEqual(range);
  });

  it("falls back to 30 days for custom without range", () => {
    expect(getDateRange("custom", undefined, now).start.getDate()).toBe(29);
  });
});

describe("buildCallsData", () => {
  it("returns zeroed KPIs for no calls", () => {
    const data = buildCallsData([]);
    expect(data.kpis).toEqual({
      totalCalls: 0,
      validCalls: 0,
      answerRate: 0,
      validRate: 0,
      minutesTalked: 0,
      totalCost: 0,
      costCurrency: null,
    });
    expect(data.dailyData).toEqual([]);
    expect(data.hourlyData).toHaveLength(24);
    expect(data.agentData).toEqual([]);
  });

  it("computes KPIs across calls", () => {
    const data = buildCallsData([
      makeCall({ talk_duration: 120, cost: 0.25 }),
      makeCall({ talk_duration: 20, cost: 0.05 }),
      makeCall({ status: "no_answer", talk_duration: 0, cost: 0 }),
      makeCall({ status: "busy", talk_duration: 0, cost: 0 }),
    ]);
    expect(data.kpis.totalCalls).toBe(4);
    expect(data.kpis.validCalls).toBe(1);
    expect(data.kpis.answerRate).toBe(50);
    expect(data.kpis.validRate).toBe(25);
    expect(data.kpis.minutesTalked).toBe(2);
    expect(data.kpis.totalCost).toBe(0.3);
  });

  it("groups daily data sorted by date", () => {
    const data = buildCallsData([
      makeCall({ call_start: "2026-09-21T09:00:00.000Z" }),
      makeCall({ call_start: "2026-09-20T09:00:00.000Z", status: "missed", talk_duration: 0 }),
      makeCall({ call_start: "2026-09-21T11:00:00.000Z", talk_duration: 10 }),
    ]);
    expect(data.dailyData).toEqual([
      { date: "2026-09-20", total: 1, answered: 0, valid: 0 },
      { date: "2026-09-21", total: 2, answered: 2, valid: 1 },
    ]);
  });

  it("buckets calls by local hour", () => {
    const start = new Date(2026, 8, 20, 14, 30).toISOString();
    const data = buildCallsData([makeCall({ call_start: start }), makeCall({ call_start: start })]);
    expect(data.hourlyData[14]).toEqual({ hour: 14, count: 2 });
  });

  it("aggregates per agent, falling back to sip then 'Sin asignar'", () => {
    const data = buildCallsData([
      makeCall({ agent_name: "Eduardo", talk_duration: 90, cost: 0.2 }),
      makeCall({ agent_name: "Eduardo", status: "no_answer", talk_duration: 0, cost: 0 }),
      makeCall({ agent_name: "", sip: "105" }),
      makeCall({ agent_name: "", sip: "" }),
    ]);
    const eduardo = data.agentData.find((a) => a.agent === "Eduardo");
    expect(eduardo).toEqual({
      agent: "Eduardo",
      total: 2,
      answered: 1,
      missed: 1,
      valid: 1,
      minutes: 1.5,
      avgDuration: 1.5,
      validRate: 50,
      answerRate: 50,
      cost: 0.2,
    });
    expect(data.agentData[0].agent).toBe("Eduardo");
    expect(data.agentData.map((a) => a.agent)).toEqual(
      expect.arrayContaining(["105", "Sin asignar"]),
    );
  });

  it("exposes every call of the period", () => {
    const calls = Array.from({ length: 60 }, () => makeCall());
    expect(buildCallsData(calls).calls).toHaveLength(60);
  });
});

describe("costCurrency", () => {
  it("uses the currency reported by the billed calls", () => {
    const data = buildCallsData([makeCall({ cost_currency: null, cost: 0 }), makeCall({ cost_currency: "USD" })]);
    expect(data.kpis.costCurrency).toBe("USD");
  });

  it("is null when no call has a currency", () => {
    expect(buildCallsData([makeCall({ cost_currency: null })]).kpis.costCurrency).toBeNull();
  });
});

describe("filterCalls", () => {
  const calls = [
    makeCall({ status: "answered", direction: "outgoing" }),
    makeCall({ status: "no_answer", direction: "outgoing" }),
    makeCall({ status: "answered", direction: "incoming" }),
    makeCall({ status: "missed", direction: "incoming" }),
  ];

  it("returns every call for 'all' filters", () => {
    expect(filterCalls(calls, { status: "all", direction: "all" })).toHaveLength(4);
  });

  it("keeps only answered calls", () => {
    const result = filterCalls(calls, { status: "answered", direction: "all" });
    expect(result.map((c) => c.status)).toEqual(["answered", "answered"]);
  });

  it("combines status and direction", () => {
    const result = filterCalls(calls, { status: "answered", direction: "incoming" });
    expect(result).toEqual([calls[2]]);
  });

  it("keeps only valid calls for the 'valid' status", () => {
    const valid = makeCall({ status: "answered", talk_duration: 45 });
    const short = makeCall({ status: "answered", talk_duration: 10 });
    expect(filterCalls([valid, short], { status: "valid", direction: "all" })).toEqual([valid]);
  });
});
