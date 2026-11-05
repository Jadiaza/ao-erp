import { describe, expect, it } from "bun:test";
import {
  createReversalLines,
  sumVoucherLines,
  validateVoucher,
  type LedgerAccount,
  type LedgerPeriod,
  type LedgerVoucherInput,
} from "./index";

const accounts: LedgerAccount[] = [
  { id: "cash", code: "1105", name: "Caja", active: true, acceptsPostings: true },
  { id: "income", code: "4135", name: "Donaciones", active: true, acceptsPostings: true },
  { id: "header", code: "1", name: "Activo", active: true, acceptsPostings: false },
];

const period: LedgerPeriod = {
  id: "2026-10",
  startsOn: "2026-10-01",
  endsOn: "2026-10-31",
  status: "open",
};

const voucher: LedgerVoucherInput = {
  id: "RC-0001",
  organizationId: "org-1",
  accountingEntityId: "parish-1",
  periodId: "2026-10",
  date: "2026-10-15",
  description: "Donación recibida",
  lines: [
    { accountId: "cash", debitMinor: 100000, creditMinor: 0 },
    { accountId: "income", debitMinor: 0, creditMinor: 100000 },
  ],
};

describe("ledger voucher validation", () => {
  it("accepts a balanced voucher in an open period", () => {
    expect(validateVoucher(voucher, accounts, period)).toMatchObject({
      valid: true,
      debitMinor: 100000,
      creditMinor: 100000,
      issues: [],
    });
  });

  it("rejects unbalanced vouchers", () => {
    const result = validateVoucher({
      ...voucher,
      lines: [
        voucher.lines[0]!,
        { ...voucher.lines[1]!, creditMinor: 99999 },
      ],
    }, accounts, period);
    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.code === "UNBALANCED_VOUCHER")).toBe(true);
  });

  it("rejects grouping accounts and inactive periods", () => {
    const result = validateVoucher({
      ...voucher,
      lines: [
        { accountId: "header", debitMinor: 100000, creditMinor: 0 },
        voucher.lines[1]!,
      ],
    }, accounts, { ...period, status: "closed" });
    expect(result.issues.some((entry) => entry.code === "ACCOUNT_NOT_POSTABLE")).toBe(true);
    expect(result.issues.some((entry) => entry.code === "PERIOD_NOT_OPEN")).toBe(true);
  });

  it("rejects fractional amounts to prevent floating-point currency errors", () => {
    const result = validateVoucher({
      ...voucher,
      lines: [
        { ...voucher.lines[0]!, debitMinor: 100.5 },
        voucher.lines[1]!,
      ],
    }, accounts, period);
    expect(result.issues.some((entry) => entry.code === "INVALID_AMOUNT")).toBe(true);
  });

  it("creates a reversal without mutating the original lines", () => {
    const reversed = createReversalLines(voucher.lines);
    expect(reversed).toEqual([
      { accountId: "cash", debitMinor: 0, creditMinor: 100000, description: "Reversión" },
      { accountId: "income", debitMinor: 100000, creditMinor: 0, description: "Reversión" },
    ]);
    expect(sumVoucherLines(reversed)).toEqual({ debitMinor: 100000, creditMinor: 100000 });
    expect(voucher.lines[0]!.debitMinor).toBe(100000);
  });
});
