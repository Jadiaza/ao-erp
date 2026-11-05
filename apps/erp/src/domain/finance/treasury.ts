import { isIsoCalendarDate, money, type Money } from "../shared/primitives";

export type CashMovementStatus = "draft" | "pending_approval" | "approved" | "posted" | "reconciled" | "cancelled";
export type CashMovement = { id: string; direction: "inflow" | "outflow"; amountMinor: number; currency: string; accountId: string; date: string; status: CashMovementStatus; sourceType: "donation" | "offering" | "purchase" | "payroll" | "transfer" | "other"; sourceId?: string; reference?: string; reversalOfId?: string };
export type CashAccount = { id: string; name: string; kind: "cash" | "bank" | "restricted_fund"; currency: string; openingBalanceMinor: number; movements: CashMovement[] };

export function validateCashMovement(movement: CashMovement): string[] {
  const errors: string[] = [];
  if (!movement.id.trim() || !movement.accountId.trim()) errors.push("MOVEMENT_ID_AND_ACCOUNT_REQUIRED");
  if (!Number.isSafeInteger(movement.amountMinor) || movement.amountMinor <= 0) errors.push("MOVEMENT_AMOUNT_MUST_BE_POSITIVE_INTEGER");
  if (!/^[A-Z]{3}$/.test(movement.currency)) errors.push("MOVEMENT_CURRENCY_INVALID");
  if (!isIsoCalendarDate(movement.date)) errors.push("MOVEMENT_DATE_INVALID");
  if (movement.sourceId && !movement.sourceType) errors.push("MOVEMENT_SOURCE_TYPE_REQUIRED");
  if (movement.reversalOfId && movement.reversalOfId === movement.id) errors.push("MOVEMENT_CANNOT_REVERSE_ITSELF");
  return errors;
}

export function calculateCashBalance(account: CashAccount, asOf?: string): Money {
  if (!Number.isSafeInteger(account.openingBalanceMinor)) throw new Error("CASH_OPENING_BALANCE_INVALID");
  if (asOf && !isIsoCalendarDate(asOf)) throw new Error("CASH_BALANCE_DATE_INVALID");
  const balance = account.movements
    .filter((item) => item.status === "posted" || item.status === "reconciled")
    .filter((item) => !asOf || item.date <= asOf)
    .reduce((total, item) => total + (item.direction === "inflow" ? item.amountMinor : -item.amountMinor), account.openingBalanceMinor);
  return money(balance, account.currency);
}

export function approveCashMovement(movement: CashMovement): CashMovement {
  if (movement.status !== "pending_approval") throw new Error("CASH_MOVEMENT_NOT_PENDING_APPROVAL");
  const errors = validateCashMovement(movement);
  if (errors.length) throw new Error(errors.join("|"));
  return { ...movement, status: "approved" };
}

export function postCashMovement(movement: CashMovement): CashMovement {
  if (movement.status !== "approved") throw new Error("CASH_MOVEMENT_NOT_APPROVED");
  const errors = validateCashMovement(movement);
  if (errors.length) throw new Error(errors.join("|"));
  return { ...movement, status: "posted" };
}

export function reconcileCashMovement(movement: CashMovement, bankAmountMinor: number): CashMovement {
  if (movement.status !== "posted") throw new Error("CASH_MOVEMENT_NOT_POSTED");
  if (bankAmountMinor !== (movement.direction === "inflow" ? movement.amountMinor : -movement.amountMinor)) throw new Error("BANK_AMOUNT_MISMATCH");
  return { ...movement, status: "reconciled" };
}

/** Creates a draft counter-movement; the posted original remains immutable. */
export function createCashMovementReversal(original: CashMovement, reversalId: string, reversalDate: string, reason: string): CashMovement {
  if (original.status !== "posted" && original.status !== "reconciled") throw new Error("CASH_REVERSAL_ORIGINAL_NOT_POSTED");
  if (!reversalId.trim() || !reason.trim() || !isIsoCalendarDate(reversalDate)) throw new Error("CASH_REVERSAL_CONTEXT_INVALID");
  return {
    id: reversalId,
    direction: original.direction === "inflow" ? "outflow" : "inflow",
    amountMinor: original.amountMinor,
    currency: original.currency,
    accountId: original.accountId,
    date: reversalDate,
    status: "draft",
    sourceType: original.sourceType,
    sourceId: original.id,
    reference: reason,
    reversalOfId: original.id,
  };
}

export function transferCash(from: CashAccount, to: CashAccount, amountMinor: number, transferDate: string, transferId: string): { outgoing: CashMovement; incoming: CashMovement } {
  if (from.id === to.id) throw new Error("TRANSFER_ACCOUNTS_MUST_DIFFER");
  if (from.currency !== to.currency) throw new Error("TRANSFER_CURRENCY_MISMATCH");
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0 || !transferId.trim()) throw new Error("TRANSFER_AMOUNT_OR_ID_INVALID");
  if (!isIsoCalendarDate(transferDate)) throw new Error("TRANSFER_DATE_INVALID");
  if (calculateCashBalance(from).amountMinor < amountMinor) throw new Error("TRANSFER_INSUFFICIENT_FUNDS");
  const common = { date: transferDate, amountMinor, currency: from.currency, status: "draft" as const, sourceType: "transfer" as const, sourceId: transferId, reference: transferId };
  return {
    outgoing: { ...common, id: `${transferId}-OUT`, direction: "outflow", accountId: from.id },
    incoming: { ...common, id: `${transferId}-IN`, direction: "inflow", accountId: to.id },
  };
}