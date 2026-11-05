import { describe, expect, it } from "vitest";
import { cashMovementToLedgerVoucher, collectReceivableIntoTreasury, paySupplierFromTreasury, receivePurchaseIntoInventory, reservePurchaseAgainstBudget, registerPurchaseSupplierInvoice, settleSupplierInvoicePayment, proposeCashReversal } from "./financial-workflows";
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


describe("ciclo de compra, factura, pago y presupuesto", () => {
  it("convierte compromiso en causación y registra pago parcial sin duplicar el gasto", () => {
    const request: PurchaseRequest = { id: "po-erp-1", requesterId: "u1", supplierId: "sup1", status: "received", lines: [{ id: "l1", description: "Papelería", quantity: 2, unitPriceMinor: 10000, receivedQuantity: 2, expenseAccountCode: "5105", costCenterId: "cc-admin" }] };
    const budget: BudgetLine = { id: "bl1", accountCode: "5105", costCenterId: "cc-admin", direction: "expense", approvedAmountMinor: 50000, committedAmountMinor: 20000, accruedAmountMinor: 0, paidAmountMinor: 0 };
    const invoice = registerPurchaseSupplierInvoice(request, { payableId: "ap-1", invoiceNumber: "FE-100", issueDate: "2026-11-05", dueDate: "2026-12-05", currency: "COP", allocations: [{ purchaseLineId: "l1", amountMinor: 20000 }] }, [budget]);
    expect(invoice.payable.status).toBe("approved");
    expect(invoice.budgetLines[0]).toMatchObject({ committedAmountMinor: 0, accruedAmountMinor: 20000, paidAmountMinor: 0 });
    const movement: CashMovement = { id: "cash-ap-1", direction: "outflow", amountMinor: 10000, currency: "COP", accountId: "bank1", date: "2026-11-06", status: "posted", sourceType: "purchase", sourceId: "ap-1" };
    const paid = settleSupplierInvoicePayment(invoice.payable, { id: "payment-1", payableId: "ap-1", amountMinor: 10000, paidOn: "2026-11-06", cashMovementId: "cash-ap-1", reference: "Abono factura" }, movement, invoice.budgetLines, invoice.allocations, { voucherId: "v-ap-1", accountingEntityId: "entity-1", organizationId: "org-1", accountsPayableAccountId: "2205" });
    expect(paid.payable).toMatchObject({ paidMinor: 10000, status: "partially_paid" });
    expect(paid.budgetLines[0]).toMatchObject({ committedAmountMinor: 0, accruedAmountMinor: 20000, paidAmountMinor: 10000 });
    expect(paid.ledgerProposal.lines.reduce((sum, line) => sum + line.debitMinor, 0)).toBe(10000);
    expect(paid.ledgerProposal.lines.reduce((sum, line) => sum + line.creditMinor, 0)).toBe(10000);
  });
  it("rechaza facturas por encima de lo recibido", () => {
    const request: PurchaseRequest = { id: "po-erp-2", requesterId: "u1", supplierId: "sup1", status: "partially_received", lines: [{ id: "l1", description: "Sillas", quantity: 4, unitPriceMinor: 10000, receivedQuantity: 1, expenseAccountCode: "5105", costCenterId: "cc-admin" }] };
    const budget: BudgetLine = { id: "bl1", accountCode: "5105", costCenterId: "cc-admin", direction: "expense", approvedAmountMinor: 50000, committedAmountMinor: 40000, accruedAmountMinor: 0, paidAmountMinor: 0 };
    expect(() => registerPurchaseSupplierInvoice(request, { payableId: "ap-2", invoiceNumber: "FE-101", issueDate: "2026-11-05", dueDate: "2026-12-05", currency: "COP", allocations: [{ purchaseLineId: "l1", amountMinor: 20000 }] }, [budget])).toThrow("PURCHASE_INVOICE_EXCEEDS_RECEIVED_VALUE");
  });
  it("propone reverso sin modificar el movimiento original", () => {
    const original: CashMovement = { id: "cash-original", direction: "outflow", amountMinor: 5000, currency: "COP", accountId: "bank1", date: "2026-11-05", status: "posted", sourceType: "purchase" };
    const reversal = proposeCashReversal(original, "cash-reversal", "2026-11-06", "Anulación de pago");
    expect(reversal).toMatchObject({ direction: "inflow", status: "draft", reversalOfId: "cash-original", amountMinor: 5000 });
    expect(original.status).toBe("posted");
  });
});
