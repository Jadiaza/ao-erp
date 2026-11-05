import { describe, expect, it } from "vitest";
import { calculateCashBalance, postCashMovement, reconcileCashMovement, transferCash, type CashAccount, type CashMovement } from "./treasury";

const movement: CashMovement = { id: "M1", direction: "inflow", amountMinor: 10000, currency: "COP", accountId: "C1", date: "2026-11-01", status: "posted", sourceType: "offering" };
const account: CashAccount = { id: "C1", name: "Caja", kind: "cash", currency: "COP", openingBalanceMinor: 5000, movements: [movement] };

describe("tesorería", () => {
  it("calcula saldo solo con movimientos contabilizados", () => expect(calculateCashBalance(account).amountMinor).toBe(15000));
  it("no permite contabilizar sin aprobación", () => expect(() => postCashMovement({ ...movement, status: "pending_approval" })).toThrow("CASH_MOVEMENT_NOT_APPROVED"));
  it("concilia únicamente si coincide el importe bancario", () => {
    expect(reconcileCashMovement(movement, 10000).status).toBe("reconciled");
    expect(() => reconcileCashMovement(movement, 9000)).toThrow("BANK_AMOUNT_MISMATCH");
  });
  it("genera dos lados de una transferencia y no permite sobregiro", () => {
    const destination: CashAccount = { ...account, id: "C2", movements: [] };
    expect(transferCash(account, destination, 1000, "2026-11-05").incoming.direction).toBe("inflow");
    expect(() => transferCash(account, destination, 999999, "2026-11-05")).toThrow("TRANSFER_INSUFFICIENT_FUNDS");
  });
});
