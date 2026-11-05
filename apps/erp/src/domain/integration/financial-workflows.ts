import type { LedgerLineInput, LedgerVoucherInput } from "../../modules/accounting/domain/ledger-core";
import type { BudgetLine } from "../finance/budget";
import type { Payable, PayablePayment } from "../finance/payables";
import { registerPayablePayment } from "../finance/payables";
import type { Receivable, Collection } from "../finance/receivables";
import { registerCollection } from "../finance/receivables";
import { accrueBudgetAmount, commitBudgetAmount, registerBudgetPayment } from "../finance/budget";
import type { CashMovement } from "../finance/treasury";\nimport { createCashMovementReversal } from "../finance/treasury";
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

export type SupplierInvoiceAllocation = { purchaseLineId: string; accountCode: string; costCenterId: string; accruedAmountMinor: number; paidAmountMinor: number };
export type SupplierInvoiceInput = {
  payableId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  allocations: readonly { purchaseLineId: string; amountMinor: number }[];
};

/** Registers the supplier invoice against quantities actually received and converts commitments into accruals. */
export function registerPurchaseSupplierInvoice(
  request: PurchaseRequest,
  input: SupplierInvoiceInput,
  budgetLines: readonly BudgetLine[],
): { payable: Payable; budgetLines: BudgetLine[]; allocations: SupplierInvoiceAllocation[] } {
  if (request.status !== "partially_received" && request.status !== "received") throw new Error("PURCHASE_INVOICE_REQUIRES_RECEIPT");
  if (!input.payableId.trim() || !input.invoiceNumber.trim() || !isIsoCalendarDate(input.issueDate) || !isIsoCalendarDate(input.dueDate) || input.dueDate < input.issueDate || !/^[A-Z]{3}$/.test(input.currency)) throw new Error("PURCHASE_INVOICE_HEADER_INVALID");
  if (!input.allocations.length || new Set(input.allocations.map((item) => item.purchaseLineId)).size !== input.allocations.length) throw new Error("PURCHASE_INVOICE_ALLOCATIONS_INVALID");
  const purchaseLines = new Map(request.lines.map((line) => [line.id, line]));
  const updatedBudget = [...budgetLines];
  const allocations: SupplierInvoiceAllocation[] = [];
  let totalMinor = 0;
  for (const allocation of input.allocations) {
    const purchaseLine = purchaseLines.get(allocation.purchaseLineId);
    if (!purchaseLine || !Number.isSafeInteger(allocation.amountMinor) || allocation.amountMinor <= 0) throw new Error("PURCHASE_INVOICE_LINE_INVALID");
    const receivedValue = purchaseLine.receivedQuantity * purchaseLine.unitPriceMinor;
    if (allocation.amountMinor > receivedValue) throw new Error(`PURCHASE_INVOICE_EXCEEDS_RECEIVED_VALUE:${purchaseLine.id}`);
    const budgetIndex = updatedBudget.findIndex((line) => line.accountCode === purchaseLine.expenseAccountCode && line.costCenterId === purchaseLine.costCenterId && line.direction === "expense");
    if (budgetIndex < 0) throw new Error(`PURCHASE_BUDGET_LINE_NOT_FOUND:${purchaseLine.expenseAccountCode}:${purchaseLine.costCenterId}`);
    updatedBudget[budgetIndex] = accrueBudgetAmount(updatedBudget[budgetIndex], allocation.amountMinor);
    allocations.push({ purchaseLineId: purchaseLine.id, accountCode: purchaseLine.expenseAccountCode, costCenterId: purchaseLine.costCenterId, accruedAmountMinor: allocation.amountMinor, paidAmountMinor: 0 });
    totalMinor += allocation.amountMinor;
    if (!Number.isSafeInteger(totalMinor)) throw new Error("PURCHASE_INVOICE_TOTAL_OUT_OF_RANGE");
  }
  if (totalMinor <= 0) throw new Error("PURCHASE_INVOICE_TOTAL_INVALID");
  const payable: Payable = {
    id: input.payableId,
    supplierId: request.supplierId ?? "",
    invoiceNumber: input.invoiceNumber,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    currency: input.currency,
    totalMinor,
    paidMinor: 0,
    status: "approved",
    purchaseOrderId: request.id,
  };
  return { payable, budgetLines: updatedBudget, allocations };
}

/** Applies a posted treasury payment to the payable and its originating budget accruals. */
export function settleSupplierInvoicePayment(
  payable: Payable,
  payment: PayablePayment,
  movement: CashMovement,
  budgetLines: readonly BudgetLine[],
  allocations: readonly SupplierInvoiceAllocation[],
): { payable: Payable; payment: PayablePayment; budgetLines: BudgetLine[]; allocations: SupplierInvoiceAllocation[]; ledgerProposal: LedgerVoucherInput } {
  const settled = paySupplierFromTreasury(payable, payment, movement);
  const nextAllocations = allocations.map((allocation) => ({ ...allocation }));
  const nextBudget = [...budgetLines];
  let remaining = payment.amountMinor;
  for (const allocation of nextAllocations) {
    const outstanding = allocation.accruedAmountMinor - allocation.paidAmountMinor;
    const applied = Math.min(outstanding, remaining);
    if (applied <= 0) continue;
    const index = nextBudget.findIndex((line) => line.accountCode === allocation.accountCode && line.costCenterId === allocation.costCenterId && line.direction === "expense");
    if (index < 0) throw new Error("PURCHASE_PAYMENT_BUDGET_LINE_NOT_FOUND");
    nextBudget[index] = registerBudgetPayment(nextBudget[index], applied);
    allocation.paidAmountMinor += applied;
    remaining -= applied;
    if (remaining === 0) break;
  }
  if (remaining !== 0) throw new Error("PURCHASE_PAYMENT_EXCEEDS_INVOICE_ALLOCATIONS");
  const ledgerProposal = cashMovementToLedgerVoucher(
    movement,
    `VCH-${payment.id}`,
    movement.date.slice(0, 7),
    "REQUIRES_ACCOUNTING_ENTITY_MAPPING",
    "REQUIRES_ORGANIZATION_MAPPING",
    movement.accountId,
    "REQUIRES_ACCOUNTS_PAYABLE_MAPPING",
  );
  return { ...settled, budgetLines: nextBudget, allocations: nextAllocations, ledgerProposal };
}

export function proposeCashReversal(movement: CashMovement, reversalId: string, reversalDate: string, reason: string): CashMovement {
  return createCashMovementReversal(movement, reversalId, reversalDate, reason);
}
