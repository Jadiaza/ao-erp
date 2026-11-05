import { describe, expect, it } from "vitest";
import { cashMovementToLedgerVoucher, receivePurchaseIntoInventory, reservePurchaseAgainstBudget } from "./financial-workflows";
import type { BudgetLine } from "../finance/budget";
import type { CashMovement } from "../finance/treasury";
import type { PurchaseRequest } from "../procurement/procurement";

describe("flujos financieros intermodulares", () => {
  it("reserva presupuesto al aprobar el compromiso de compra", () => {
    const budget: BudgetLine = { id: "b1", accountCode: "51", costCenterId: "cc1", direction: "expense", approvedAmountMinor: 100000, committedAmountMinor: 0, accruedAmountMinor: 0, paidAmountMinor: 0 };
    const request: PurchaseRequest = { id: "po1", requesterId: "u1", status: "approved", lines: [{ id: "item1", description: "Material", quantity: 2, unitPriceMinor: 10000, receivedQuantity: 0, expenseAccountCode: "51", costCenterId: "cc1" }] };
    expect(reservePurchaseAgainstBudget(budget, request).budgetLine.committedAmountMinor).toBe(20000);
  });
  it("convierte recepción de compra en movimientos de inventario trazables", () => {
    const request: PurchaseRequest = { id: "po1", requesterId: "u1", supplierId: "s1", status: "ordered", lines: [{ id: "line1", inventoryItemId: "item1", description: "Material", quantity: 3, unitPriceMinor: 5000, receivedQuantity: 0, expenseAccountCode: "51", costCenterId: "cc1" }] };
    const result = receivePurchaseIntoInventory(request, { line1: 2 }, "warehouse1", "2026-11-05");
    expect(result.request.status).toBe("partially_received");
    expect(result.movements[0]).toMatchObject({ itemId: "item1", quantity: 2, sourceId: "po1" });
  });
  it("genera un comprobante balanceado desde un movimiento contabilizado", () => {
    const movement: CashMovement = { id: "cash1", direction: "inflow", amountMinor: 25000, currency: "COP", accountId: "bank1", date: "2026-11-05", status: "posted", sourceType: "offering" };
    const voucher = cashMovementToLedgerVoucher(movement, "v1", "2026-11", "entity1", "org1", "bank-account", "income-account");
    expect(voucher.lines.reduce((sum, line) => sum + line.debitMinor, 0)).toBe(25000);
    expect(voucher.lines.reduce((sum, line) => sum + line.creditMinor, 0)).toBe(25000);
  });
});
