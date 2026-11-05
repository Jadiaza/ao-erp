import { isIsoCalendarDate, money, type Money } from "../shared/primitives";

export type CashMovementStatus = "draft" | "pending_approval" | "approved" | "posted" | "reconciled" | "cancelled";
export type CashMovement = { id: string; direction: "inflow" | "outflow"; amountMinor: number; currency: string; accountId: string; date: string; status: CashMovementStatus; sourceType: "donation" | "offering" | "purchase" | "payroll" | "transfer" | "other"; sourceId?: string; reference?: string };
export type CashAccount = { id: string; name: string; kind: "cash" | "bank" | "restricted_fund"; currency: string; openingBalanceMinor: number; movements: CashMovement[] };

export function validateCashMovement(movement: CashMovement): string[] {
  const errors: string[] = [];
  if (!movement.id.trim() || !movement.accountId.trim()) errors.push("MOVEMENT_ID_AND_ACCOUNT_REQUIRED");
  if (!Number.isSafeInteger(movement.amountMinor) || movement.amountMinor <= 0) errors.push("MOVEMENT_AMOUNT_MUST_BE_POSITIVE_INTEGER");
  if (!/^[A-Z]{3}$/.test(movement.currency)) errors.push("MOVEMENT_CURRENCY_INVALID");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(movement.date) || Number.isNaN(Date.parse(movement.date))) errors.push("MOVEMENT_DATE_INVALID");
  if (movement.sourceId && !movement.sourceType) errors.push("MOVEMENT_SOURCE_TYPE_REQUIRED");
  return errors;
}

export function calculateCashBalance(account: CashAccount, asOf?: string): Money {
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
  return { ...movement, status: "posted" };
}

export function reconcileCashMovement(movement: CashMovement, bankAmountMinor: number): CashMovement {
  if (movement.status !== "posted") throw new Error("CASH_MOVEMENT_NOT_POSTED");
  if (bankAmountMinor !== (movement.direction === "inflow" ? movement.amountMinor : -movement.amountMinor)) throw new Error("BANK_AMOUNT_MISMATCH");
  return { ...movement, status: "reconciled" };
}

export function transferCash(from: CashAccount, to: CashAccount, amountMinor: number, transferDate: string): { outgoing: CashMovement; incoming: CashMovement } {
  if (from.id === to.id) throw new Error("TRANSFER_ACCOUNTS_MUST_DIFFER");
  if (from.currency !== to.currency) throw new Error("TRANSFER_CURRENCY_MISMATCH");
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("TRANSFER_AMOUNT_INVALID");\n  if (!isIsoCalendarDate(transferDate)) throw new Error("TRANSFER_DATE_INVALID");
  if (calculateCashBalance(from).amountMinor < amountMinor) throw new Error("TRANSFER_INSUFFICIENT_FUNDS");
  const common = { date: transferDate, amountMinor, currency: from.currency, status: "draft" as const, sourceType: "transfer" as const };
  return {
    outgoing: { ...common, id: `${from.id}-OUT-${to.id}-${amountMinor}`, direction: "outflow", accountId: from.id },
    incoming: { ...common, id: `${to.id}-IN-${from.id}-${amountMinor}`, direction: "inflow", accountId: to.id },
  };
}
