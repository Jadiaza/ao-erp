export type BudgetStatus = "draft" | "submitted" | "approved" | "closed";
export type BudgetLine = { id: string; accountCode: string; costCenterId: string; direction: "income" | "expense"; approvedAmountMinor: number; committedAmountMinor: number; accruedAmountMinor: number; paidAmountMinor: number };
export type Budget = { id: string; period: string; status: BudgetStatus; lines: BudgetLine[] };

export function validateBudget(budget: Budget): string[] {
  const errors: string[] = [];
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(budget.period)) errors.push("BUDGET_PERIOD_INVALID");
  if (new Set(budget.lines.map((line) => line.id)).size !== budget.lines.length) errors.push("BUDGET_LINE_DUPLICATE");
  for (const line of budget.lines) {
    if (![line.approvedAmountMinor,line.committedAmountMinor,line.accruedAmountMinor,line.paidAmountMinor].every(Number.isSafeInteger)) errors.push(`BUDGET_AMOUNT_NOT_INTEGER:${line.id}`);
    if ([line.approvedAmountMinor,line.committedAmountMinor,line.accruedAmountMinor,line.paidAmountMinor].some((amount) => amount < 0)) errors.push(`BUDGET_AMOUNT_NEGATIVE:${line.id}`);
    if (line.paidAmountMinor > line.accruedAmountMinor) errors.push(`PAYMENT_EXCEEDS_ACCRUAL:${line.id}`);
  }
  return errors;
}

export function budgetAvailability(line: BudgetLine): number {
  return line.approvedAmountMinor - line.committedAmountMinor;
}
export function budgetExecution(line: BudgetLine): number {
  if (line.approvedAmountMinor === 0) return line.accruedAmountMinor === 0 ? 0 : 100;
  return line.accruedAmountMinor / line.approvedAmountMinor * 100;
}
export function commitBudgetAmount(line: BudgetLine, amountMinor: number): BudgetLine {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("BUDGET_COMMIT_AMOUNT_INVALID");
  if (budgetAvailability(line) < amountMinor) throw new Error("BUDGET_INSUFFICIENT_AVAILABILITY");
  return { ...line, committedAmountMinor: line.committedAmountMinor + amountMinor };
}
export function accrueBudgetAmount(line: BudgetLine, amountMinor: number): BudgetLine {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("BUDGET_ACCRUAL_AMOUNT_INVALID");
  if (line.accruedAmountMinor + amountMinor > line.committedAmountMinor) throw new Error("BUDGET_ACCRUAL_EXCEEDS_COMMITMENT");
  return { ...line, accruedAmountMinor: line.accruedAmountMinor + amountMinor };
}
export function registerBudgetPayment(line: BudgetLine, amountMinor: number): BudgetLine {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("BUDGET_PAYMENT_AMOUNT_INVALID");
  if (line.paidAmountMinor + amountMinor > line.accruedAmountMinor) throw new Error("BUDGET_PAYMENT_EXCEEDS_ACCRUAL");
  return { ...line, paidAmountMinor: line.paidAmountMinor + amountMinor };
}
