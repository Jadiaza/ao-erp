import type { LedgerLineInput, LedgerVoucherInput } from "../../modules/accounting/domain/ledger-core";
import type { BudgetLine } from "../finance/budget";
import type { Payable, PayablePayment } from "../finance/payables";
import { registerPayablePayment } from "../finance/payables";
import type { Receivable, Collection } from "../finance/receivables";
import { registerCollection } from "../finance/receivables";
import { commitBudgetAmount } from "../finance/budget";
import type { CashMovement } from "../finance/treasury";
import type { PurchaseRequest } from "../procurement/procurement";
import type { StockMovement } from "../inventory/inventory";
import { isIsoCalendarDate } from "../shared/primitives";
import { purchaseTotal, receivePurchaseItems } from "../procurement/procurement";

export function reservePurchaseAgainstBudget(lines: readonly BudgetLine[], request: PurchaseRequest): { budgetLines: BudgetLine[]; committedAmountMinor: number } {
  if (request.status !== "approved") throw new Error("PURCHASE_REQUEST_NOT_APPROVED_FOR_BUDGET");
  const updated = [...lines];
  for (const purchaseLine of request.lines) {
    const budgetIndex = updated.findIndex((line) => line.accountCode === purchaseLine.expenseAccountCode && line.costCenterId === purchaseLine.costCenterId && line.direction === "expense");
    if (budgetIndex < 0) throw new Error(`PURCHASE_BUDGET_LINE_NOT_FOUND:${purchaseLine.expenseAccountCode}:${purchaseLine.costCenterId}`);
    updated[budgetIndex] = commitBudgetAmount(updated[budgetIndex], purchaseLine.quantity * purchaseLine.unitPriceMinor);
  }
  return { budgetLines: updated, committedAmountMinor: purchaseTotal(request) };
}

export function receivePurchaseIntoInventory(
  request: PurchaseRequest,
  receivedQuantities: Readonly<Record<string, number>>,
  warehouseId: string,
  receivedOn: string,
  receiptId: string,
): { request: PurchaseRequest; movements: StockMovement[] } {
  if (!warehouseId.trim() || !receiptId.trim() || !isIsoCalendarDate(receivedOn)) throw new Error("PURCHASE_RECEIPT_CONTEXT_INVALID");
  const knownLineIds = new Set(request.lines.map((line) => line.id));
  if (Object.keys(receivedQuantities).some((id) => !knownLineIds.has(id))) throw new Error("PURCHASE_RECEIPT_UNKNOWN_LINE");
  const updated = receivePurchaseItems(request, receivedQuantities);
  const movements = request.lines.flatMap((line) => {
    const quantity = receivedQuantities[line.id] ?? 0;
    if (!quantity) return [];
    if (!line.inventoryItemId) throw new Error(`PURCHASE_INVENTORY_ITEM_REQUIRED:${line.id}`);
    return [{
      id: `STK-${receiptId}-${line.id}`,
      itemId: line.inventoryItemId,
      warehouseId,
      kind: "receipt" as const,
      quantity,
      unitCostMinor: line.unitPriceMinor,
      occurredOn: receivedOn,
      sourceType: "purchase_receipt",
      sourceId: receiptId,
    }];
  });
  return { request: updated, movements };
}

export function cashMovementToLedgerVoucher(
  movement: CashMovement,
  voucherId: string,
  periodId: string,
  accountingEntityId: string,
  organizationId: string,
  cashAccountId: string,
  counterAccountId: string,
): LedgerVoucherInput {
  if (movement.status !== "posted" && movement.status !== "reconciled") throw new Error("CASH_MOVEMENT_NOT_POSTED_FOR_LEDGER");
  if (!Number.isSafeInteger(movement.amountMinor) || movement.amountMinor <= 0 || !isIsoCalendarDate(movement.date)) throw new Error("CASH_MOVEMENT_AMOUNT_OR_DATE_INVALID");
  if (movement.currency !== "COP") throw new Error("LEDGER_CURRENCY_REQUIRES_EXPLICIT_CONVERSION");
  if (!cashAccountId.trim() || !counterAccountId.trim() || cashAccountId === counterAccountId) throw new Error("LEDGER_ACCOUNT_MAPPING_INVALID");
  const cashLine: LedgerLineInput = movement.direction === "inflow"
    ? { accountId: cashAccountId, debitMinor: movement.amountMinor, creditMinor: 0, description: movement.reference ?? movement.id }
    : { accountId: cashAccountId, debitMinor: 0, creditMinor: movement.amountMinor, description: movement.reference ?? movement.id };
  const counterLine: LedgerLineInput = movement.direction === "inflow"
    ? { accountId: counterAccountId, debitMinor: 0, creditMinor: movement.amountMinor, description: movement.reference ?? movement.id }
    : { accountId: counterAccountId, debitMinor: movement.amountMinor, creditMinor: 0, description: movement.reference ?? movement.id };
  return { id: voucherId, organizationId, accountingEntityId, periodId, date: movement.date, description: `Tesorería · ${movement.sourceType} · ${movement.reference ?? movement.id}`, lines: [cashLine, counterLine] };
}

export function paySupplierFromTreasury(payable: Payable, payment: PayablePayment, movement: CashMovement): { payable: Payable; payment: PayablePayment } {
  if (movement.status !== "posted" && movement.status !== "reconciled") throw new Error("PAYABLE_REQUIRES_POSTED_CASH_MOVEMENT");
  if (movement.direction !== "outflow" || movement.amountMinor !== payment.amountMinor || movement.currency !== payable.currency) throw new Error("PAYABLE_CASH_MOVEMENT_MISMATCH");
  if (movement.id !== payment.cashMovementId || movement.date !== payment.paidOn) throw new Error("PAYABLE_CASH_MOVEMENT_REFERENCE_MISMATCH");
  return registerPayablePayment(payable, payment);
}

export function collectReceivableIntoTreasury(receivable: Receivable, collection: Collection, movement: CashMovement): Receivable {
  if (movement.status !== "posted" && movement.status !== "reconciled") throw new Error("RECEIVABLE_REQUIRES_POSTED_CASH_MOVEMENT");
  if (movement.direction !== "inflow" || movement.amountMinor !== collection.amountMinor || movement.currency !== receivable.currency) throw new Error("RECEIVABLE_CASH_MOVEMENT_MISMATCH");
  if (movement.id !== collection.cashMovementId || movement.date !== collection.collectedOn) throw new Error("RECEIVABLE_CASH_MOVEMENT_REFERENCE_MISMATCH");
  return registerCollection(receivable, collection);
}