import type { LedgerLineInput, LedgerVoucherInput } from "../../modules/accounting/domain/ledger-core";
import type { BudgetLine } from "../finance/budget";
import { commitBudgetAmount } from "../finance/budget";
import type { CashMovement } from "../finance/treasury";
import type { PurchaseRequest, StockMovement } from "../procurement/procurement";
import { receivePurchaseItems } from "../procurement/procurement";

export function reservePurchaseAgainstBudget(line: BudgetLine, request: PurchaseRequest): { budgetLine: BudgetLine; committedAmountMinor: number } {
  if (request.status !== "approved") throw new Error("PURCHASE_REQUEST_NOT_APPROVED_FOR_BUDGET");
  const amount = request.lines.reduce((total, item) => total + item.quantity * item.unitPriceMinor, 0);
  return { budgetLine: commitBudgetAmount(line, amount), committedAmountMinor: amount };
}

export function receivePurchaseIntoInventory(
  request: PurchaseRequest,
  receivedQuantities: Readonly<Record<string, number>>,
  warehouseId: string,
  receivedOn: string,
): { request: PurchaseRequest; movements: StockMovement[] } {
  if (!warehouseId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(receivedOn)) throw new Error("PURCHASE_RECEIPT_CONTEXT_INVALID");
  const updated = receivePurchaseItems(request, receivedQuantities);
  const movements = request.lines.flatMap((line) => {
    const quantity = receivedQuantities[line.id] ?? 0;
    if (!quantity) return [];
    if (!line.inventoryItemId) throw new Error(`PURCHASE_INVENTORY_ITEM_REQUIRED:${line.id}`);
    return [{
      id: `STK-${request.id}-${line.id}-${receivedOn}`,
      itemId: line.inventoryItemId,
      warehouseId,
      kind: "receipt" as const,
      quantity,
      unitCostMinor: line.unitPriceMinor,
      occurredOn: receivedOn,
      sourceType: "purchase_order",
      sourceId: request.id,
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
  if (movement.currency !== "COP") throw new Error("LEDGER_CURRENCY_REQUIRES_EXPLICIT_CONVERSION");
  if (!cashAccountId.trim() || !counterAccountId.trim() || cashAccountId === counterAccountId) throw new Error("LEDGER_ACCOUNT_MAPPING_INVALID");
  const cashLine: LedgerLineInput = movement.direction === "inflow"
    ? { accountId: cashAccountId, debitMinor: movement.amountMinor, creditMinor: 0, description: movement.reference ?? movement.id }
    : { accountId: cashAccountId, debitMinor: 0, creditMinor: movement.amountMinor, description: movement.reference ?? movement.id };
  const counterLine: LedgerLineInput = movement.direction === "inflow"
    ? { accountId: counterAccountId, debitMinor: 0, creditMinor: movement.amountMinor, description: movement.reference ?? movement.id }
    : { accountId: counterAccountId, debitMinor: movement.amountMinor, creditMinor: 0, description: movement.reference ?? movement.id };
  return {
    id: voucherId,
    organizationId,
    accountingEntityId,
    periodId,
    date: movement.date,
    description: `Tesorería · ${movement.sourceType} · ${movement.reference ?? movement.id}`,
    lines: [cashLine, counterLine],
  };
}
