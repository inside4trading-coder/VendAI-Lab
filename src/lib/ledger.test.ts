import { describe, expect, it } from "vitest";
import { buildLedger, summarizeByMember, toUsd, type LedgerMovement } from "./ledger";

function mov(overrides: Partial<LedgerMovement> = {}): LedgerMovement {
  return {
    id: crypto.randomUUID(),
    occurred_on: "2026-05-28",
    member_id: "yannick",
    kind: "ingreso",
    description: "Varios",
    currency: "USD",
    amount: 100,
    created_at: "2026-05-28T10:00:00Z",
    ...overrides,
  };
}

describe("toUsd", () => {
  it("keeps USD amounts unchanged", () => {
    expect(toUsd(100, "USD", 1.08)).toBe(100);
  });

  it("converts EUR with the configured rate", () => {
    expect(toUsd(100, "EUR", 1.08)).toBeCloseTo(108);
  });
});

describe("buildLedger", () => {
  it("returns empty rows and zero totals with no movements", () => {
    expect(buildLedger([], 1.08)).toEqual({
      rows: [],
      totals: { incomeUsd: 0, expenseUsd: 0, balanceUsd: 0 },
    });
  });

  it("reproduces the spreadsheet running balance", () => {
    const { rows, totals } = buildLedger(
      [
        mov({ occurred_on: "2026-05-28", amount: 508 }),
        mov({ occurred_on: "2026-05-28", kind: "egreso", amount: 10, created_at: "2026-05-28T11:00:00Z" }),
        mov({ occurred_on: "2026-06-28", kind: "egreso", amount: 200 }),
        mov({ occurred_on: "2026-09-05", kind: "egreso", amount: 130, member_id: "eduardo" }),
      ],
      1.08,
    );
    expect(rows.map((r) => r.balanceUsd)).toEqual([508, 498, 298, 168]);
    expect(totals).toEqual({ incomeUsd: 508, expenseUsd: 340, balanceUsd: 168 });
  });

  it("orders by date then creation time regardless of input order", () => {
    const later = mov({ occurred_on: "2026-06-01", kind: "egreso", amount: 50 });
    const earlier = mov({ occurred_on: "2026-05-01", amount: 100 });
    const { rows } = buildLedger([later, earlier], 1);
    expect(rows.map((r) => r.id)).toEqual([earlier.id, later.id]);
    expect(rows[1].balanceUsd).toBe(50);
  });

  it("converts EUR movements into the USD balance", () => {
    const { rows } = buildLedger([mov({ currency: "EUR", amount: 100 })], 1.1);
    expect(rows[0].amountUsd).toBeCloseTo(110);
    expect(rows[0].balanceUsd).toBeCloseTo(110);
  });
});

describe("summarizeByMember", () => {
  it("aggregates income, expenses, balance and income share per member", () => {
    const summary = summarizeByMember(
      [
        mov({ amount: 508 }),
        mov({ kind: "egreso", amount: 10 }),
        mov({ kind: "egreso", amount: 200 }),
        mov({ kind: "egreso", amount: 130, member_id: "eduardo" }),
      ],
      1.08,
    );
    expect(summary.members).toEqual([
      { memberId: "eduardo", incomeUsd: 0, expenseUsd: 130, balanceUsd: -130, incomeShare: 0 },
      { memberId: "yannick", incomeUsd: 508, expenseUsd: 210, balanceUsd: 298, incomeShare: 100 },
    ]);
    expect(summary.total).toEqual({ incomeUsd: 508, expenseUsd: 340, balanceUsd: 168, incomeShare: 100 });
  });

  it("lists every known member even without movements", () => {
    const summary = summarizeByMember([], 1, ["eduardo", "yannick"]);
    expect(summary.members.map((m) => m.memberId)).toEqual(["eduardo", "yannick"]);
    expect(summary.total.incomeShare).toBe(0);
  });

  it("groups movements without member under null", () => {
    const summary = summarizeByMember([mov({ member_id: null })], 1);
    expect(summary.members[0].memberId).toBeNull();
  });
});
