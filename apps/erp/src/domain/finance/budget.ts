export type BudgetStatus = "draft" | "submitted" | "approved" | "closed";
export type BudgetLine = { id: string; accountCode: string; costCenterId: string; direction: "income" | "expense"; approvedAmountMinor: number; committedAmountMinor: number; accruedAmountMinor: number; paidAmountMinor: number };
export type Budget = { id: string; period: string; status: BudgetStatus; lines: BudgetLine[] };

export function validateBudget(budget: Budget): string[] {
  const errors: string[] = [];
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(budget.period)) errors.push("BUDGET_PERIOD_INVALID");
  if (new Set(budget.lines.map((line) => line.id)).size !== budget.lines.length) errors.push("BUDGET_LINE_DUPLICATE");
  for (const line of budget.lines) {
    const amounts = [line.approvedAmountMinor, line.committedAmountMinor, line.accruedAmountMinor, line.paidAmountMinor];
    if (!amounts.every(Number.isSafeInteger)) errors.push(`BUDGET_AMOUNT_NOT_INTEGER:${line.id}`);
    if (amounts.some((amount) => amount < 0)) errors.push(`BUDGET_AMOUNT_NEGATIVE:${line.id}`);
    if (line.committedAmountMinor + line.accruedAmountMinor > line.approvedAmountMinor) errors.push(`BUDGET_EXECUTION_EXCEEDS_APPROPRIATION:${line.id}`);
    if (line.paidAmountMinor > line.accruedAmountMinor) errors.push(`PAYMENT_EXCEEDS_ACCRUAL:${line.id}`);
  }
  return errors;
}

/** Availability excludes both outstanding commitments and accrued obligations. */
export function budgetAvailability(line: BudgetLine): number {
  return line.approvedAmountMinor - line.committedAmountMinor - line.accruedAmountMinor;
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
/** Converts an outstanding commitment into an accrued supplier obligation. */
export function accrueBudgetAmount(line: BudgetLine, amountMinor: number): BudgetLine {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("BUDGET_ACCRUAL_AMOUNT_INVALID");
  if (amountMinor > line.committedAmountMinor) throw new Error("BUDGET_ACCRUAL_EXCEEDS_COMMITMENT");
  return { ...line, committedAmountMinor: line.committedAmountMinor - amountMinor, accruedAmountMinor: line.accruedAmountMinor + amountMinor };
}
export function registerBudgetPayment(line: BudgetLine, amountMinor: number): BudgetLine {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("BUDGET_PAYMENT_AMOUNT_INVALID");
  if (line.paidAmountMinor + amountMinor > line.accruedAmountMinor) throw new Error("BUDGET_PAYMENT_EXCEEDS_ACCRUAL");
  return { ...line, paidAmountMinor: line.paidAmountMinor + amountMinor };
}
export function releaseBudgetCommitment(line: BudgetLine, amountMinor: number): BudgetLine {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("BUDGET_RELEASE_AMOUNT_INVALID");
  if (amountMinor > line.committedAmountMinor) throw new Error("BUDGET_RELEASE_EXCEEDS_COMMITMENT");
  return { ...line, committedAmountMinor: line.committedAmountMinor - amountMinor };
}