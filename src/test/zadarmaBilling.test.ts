import { describe, expect, it } from "vitest";
import {
  billingCost,
  matchBillingToCalls,
  type BillingEntry,
  type PbxCallKey,
} from "../../supabase/functions/zadarma-sync/billing";

const pbx = (overrides: Partial<PbxCallKey> = {}): PbxCallKey => ({
  callId: "1790615211.333044",
  callstart: "2026-09-28 19:06:51",
  destination: "584245107856",
  caller: "Andres (100) ",
  ...overrides,
});

const bill = (overrides: Partial<BillingEntry> = {}): BillingEntry => ({
  id: "b1",
  sip: "100",
  callstart: "2026-09-28 19:06:52",
  from: "34910000000",
  to: "584245107856",
  billcost: 0.12,
  cost: 0.08,
  currency: "USD",
  ...overrides,
});

describe("billingCost", () => {
  it("prefers billcost (total charged) over cost (per-minute rate)", () => {
    expect(billingCost(bill({ billcost: 0.12, cost: 0.08 }))).toBe(0.12);
  });

  it("falls back to cost when billcost is missing", () => {
    expect(billingCost(bill({ billcost: undefined, cost: 0.08 }))).toBe(0.08);
  });

  it("does not use the per-minute rate when billcost is 0 (failed call)", () => {
    expect(billingCost(bill({ billcost: 0, cost: 0.08 }))).toBe(0);
  });

  it("returns 0 for non-numeric values", () => {
    expect(billingCost(bill({ billcost: "abc", cost: undefined }))).toBe(0);
  });
});

describe("matchBillingToCalls", () => {
  it("matches by destination number and start time within tolerance", () => {
    const result = matchBillingToCalls([pbx()], [bill()]);
    expect(result.get("1790615211.333044")).toEqual({ cost: 0.12, currency: "USD" });
  });

  it("ignores formatting differences in phone numbers", () => {
    const result = matchBillingToCalls([pbx({ destination: "+58 424 510 7856" })], [bill()]);
    expect(result.get("1790615211.333044")?.cost).toBe(0.12);
  });

  it("does not match when the time difference exceeds the tolerance", () => {
    const result = matchBillingToCalls([pbx()], [bill({ callstart: "2026-09-28 19:08:30" })]);
    expect(result.size).toBe(0);
  });

  it("does not match a different number", () => {
    const result = matchBillingToCalls([pbx()], [bill({ to: "584245220284" })]);
    expect(result.size).toBe(0);
  });

  it("uses each billing entry once, pairing repeated calls to the same number by closest time", () => {
    const calls = [
      pbx({ callId: "a", callstart: "2026-09-28 19:03:00", destination: "584245220284" }),
      pbx({ callId: "b", callstart: "2026-09-28 19:03:40", destination: "584245220284" }),
    ];
    const billing = [
      bill({ id: "x", callstart: "2026-09-28 19:03:41", to: "584245220284", billcost: 0.2 }),
      bill({ id: "y", callstart: "2026-09-28 19:03:01", to: "584245220284", billcost: 0.1 }),
    ];
    const result = matchBillingToCalls(calls, billing);
    expect(result.get("a")?.cost).toBe(0.1);
    expect(result.get("b")?.cost).toBe(0.2);
  });

  it("matches incoming calls by the caller number", () => {
    const result = matchBillingToCalls(
      [pbx({ caller: "584120538092", destination: "100" })],
      [bill({ from: "584120538092", to: "100", billcost: 0.03 })],
    );
    expect(result.get("1790615211.333044")?.cost).toBe(0.03);
  });

  it("ignores the account SIP login in billing, which differs from the PBX extension", () => {
    const result = matchBillingToCalls([pbx()], [bill({ sip: "166023" })]);
    expect(result.get("1790615211.333044")?.cost).toBe(0.12);
  });

  it("matches numbers dialled without country code (real Zadarma format)", () => {
    const result = matchBillingToCalls(
      [
        pbx({ callId: "a", callstart: "2026-09-27 17:35:50", destination: "6275999" }),
        pbx({ callId: "b", callstart: "2026-09-27 17:36:01", destination: "627596999" }),
      ],
      [
        bill({ callstart: "2026-09-27 17:35:52", to: 3406275999, billcost: 0.05 }),
        bill({ callstart: "2026-09-27 17:36:03", to: 340627596999, billcost: 0.07 }),
      ],
    );
    expect(result.get("a")?.cost).toBe(0.05);
    expect(result.get("b")?.cost).toBe(0.07);
  });

  it("skips billing entries without cost", () => {
    const result = matchBillingToCalls([pbx()], [bill({ billcost: 0, cost: 0 })]);
    expect(result.size).toBe(0);
  });
});
