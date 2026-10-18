import { describe, expect, it } from "vitest";
import { summarizeLeadCalls } from "./leadCalls";

const call = (overrides: Partial<Parameters<typeof summarizeLeadCalls>[0][number]> = {}) => ({
  call_start: "2026-10-01T10:00:00.000Z",
  status: "answered",
  talk_duration: 60,
  cost: 0.1,
  cost_currency: "EUR",
  ...overrides,
});

describe("summarizeLeadCalls", () => {
  it("returns an empty summary with no calls", () => {
    expect(summarizeLeadCalls([])).toEqual({
      total: 0,
      answered: 0,
      talkMinutes: 0,
      lastCallAt: null,
      totalCost: 0,
      costCurrency: null,
    });
  });

  it("aggregates totals and finds the latest call regardless of order", () => {
    const summary = summarizeLeadCalls([
      call({ call_start: "2026-10-01T10:00:00.000Z", talk_duration: 90, cost: 0.12 }),
      call({ call_start: "2026-10-05T09:00:00.000Z", status: "no_answer", talk_duration: 0, cost: 0 }),
      call({ call_start: "2026-10-03T12:00:00.000Z", talk_duration: 30, cost: 0.05 }),
    ]);
    expect(summary).toEqual({
      total: 3,
      answered: 2,
      talkMinutes: 2,
      lastCallAt: "2026-10-05T09:00:00.000Z",
      totalCost: 0.17,
      costCurrency: "EUR",
    });
  });

  it("ignores calls without a start time for the latest call", () => {
    expect(summarizeLeadCalls([call({ call_start: null })]).lastCallAt).toBeNull();
  });
});
