import { describe, expect, it } from "vitest";
import { cashMovementToLedgerVoucher, collectReceivableIntoTreasury, paySupplierFromTreasury, receivePurchaseIntoInventory, reservePurchaseAgainstBudget } from "./financial-workflows";
import type { Payable } from "../finance/payables";
import type { Receivable } from "../finance/receivables";
import type { BudgetLine } from "../finance/budget";
import type { CashMovement } from "../finance/treasury";
import type { PurchaseRequest } from "../procurement/procurement";

describe("flujos financieros intermodulares", () => {
  it("reserva presupuesto al aprobar el compromiso de compra", () => {
    const budget: BudgetLine = { id: "b1", accountCode: "51", costCenterId: "cc1", direction: "expense", approvedAmountMinor: 100000, committedAmountMinor: 0, accruedAmountMinor: 0, paidAmountMinor: 0 };
    const request: PurchaseRequest = { id: "po1", requesterId: "u1", status: "approved", lines: [{ id: "item1", description: "Material", quantity: 2, unitPriceMinor: 10000, receivedQuantity: 0, expenseAccountCode: "51", costCenterId: "cc1" }] };
    expect(reservePurchaseAgainstBudget([budget], request).budgetLines[0].committedAmountMinor).toBe(20000);
  });
  it("exige una línea presupuestal por cuenta y centro de costos", () => {
    const budget: BudgetLine = { id: "b1", accountCode: "51", costCenterId: "cc2", direction: "expense", approvedAmountMinor: 100000, committedAmountMinor: 0, accruedAmountMinor: 0, paidAmountMinor: 0 };
    const request: PurchaseRequest = { id: "po2", requesterId: "u1", status: "approved", lines: [{ id: "item2", description: "Material", quantity: 1, unitPriceMinor: 1000, receivedQuantity: 0, expenseAccountCode: "51", costCenterId: "cc1" }] };
    expect(() => reservePurchaseAgainstBudget([budget], request)).toThrow("PURCHASE_BUDGET_LINE_NOT_FOUND");
  });
  it("convierte recepción de compra en movimientos de inventario trazables", () => {
    const request: PurchaseRequest = { id: "po1", requesterId: "u1", supplierId: "s1", status: "ordered", lines: [{ id: "line1", inventoryItemId: "item1", description: "Material", quantity: 3, unitPriceMinor: 5000, receivedQuantity: 0, expenseAccountCode: "51", costCenterId: "cc1" }] };
    const result = receivePurchaseIntoInventory(request, { line1: 2 }, "warehouse1", "2026-11-05", "receipt-001");
    expect(result.request.status).toBe("partially_received");
    expect(result.movements[0]).toMatchObject({ itemId: "item1", quantity: 2, sourceId: "receipt-001" });
  });
  it("genera un comprobante balanceado desde un movimiento contabilizado", () => {
    const movement: CashMovement = { id: "cash1", direction: "inflow", amountMinor: 25000, currency: "COP", accountId: "bank1", date: "2026-11-05", status: "posted", sourceType: "offering" };
    const voucher = cashMovementToLedgerVoucher(movement, "v1", "2026-11", "entity1", "org1", "bank-account", "income-account");
    expect(voucher.lines.reduce((sum, line) => sum + line.debitMinor, 0)).toBe(25000);
    expect(voucher.lines.reduce((sum, line) => sum + line.creditMinor, 0)).toBe(25000);
  });
});


describe("tesorería con cuentas por pagar y cobrar", () => {
  it("solo registra pago de proveedor si existe egreso contabilizado", () => {
    const payable: Payable = { id: "ap1", supplierId: "s1", invoiceNumber: "F-10", issueDate: "2026-11-01", dueDate: "2026-11-30", currency: "COP", totalMinor: 30000, paidMinor: 0, status: "approved" };
    const movement: CashMovement = { id: "cash-out", direction: "outflow", amountMinor: 10000, currency: "COP", accountId: "bank", date: "2026-11-05", status: "posted", sourceType: "purchase" };
    const result = paySupplierFromTreasury(payable, { id: "pay1", payableId: "ap1", amountMinor: 10000, paidOn: "2026-11-05", cashMovementId: "cash-out", reference: "Pago parcial" }, movement);
    expect(result.payable.paidMinor).toBe(10000);
    expect(() => paySupplierFromTreasury(payable, { id: "pay2", payableId: "ap1", amountMinor: 10000, paidOn: "2026-11-05", cashMovementId: "cash-out", reference: "Pago" }, { ...movement, status: "draft" })).toThrow("PAYABLE_REQUIRES_POSTED_CASH_MOVEMENT");
  });
  it("solo registra recaudo si existe ingreso contabilizado", () => {
    const receivable: Receivable = { id: "ar1", debtorId: "d1", concept: "Servicio", issueDate: "2026-11-01", dueDate: "2026-11-30", currency: "COP", totalMinor: 20000, collectedMinor: 0, status: "issued", sourceType: "service" };
    const movement: CashMovement = { id: "cash-in", direction: "inflow", amountMinor: 20000, currency: "COP", accountId: "bank", date: "2026-11-05", status: "posted", sourceType: "other" };
    const result = collectReceivableIntoTreasury(receivable, { id: "col1", receivableId: "ar1", amountMinor: 20000, collectedOn: "2026-11-05", cashMovementId: "cash-in", reference: "Recaudo" }, movement);
    expect(result.status).toBe("collected");
    expect(() => collectReceivableIntoTreasury(receivable, { id: "col2", receivableId: "ar1", amountMinor: 20000, collectedOn: "2026-11-05", cashMovementId: "cash-in", reference: "Recaudo" }, { ...movement, amountMinor: 10000 })).toThrow("RECEIVABLE_CASH_MOVEMENT_MISMATCH");
  });
});
