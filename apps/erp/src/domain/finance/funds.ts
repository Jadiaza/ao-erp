export type FundRestriction = "unrestricted" | "purpose_restricted" | "time_restricted" | "donor_restricted";
export type FundStatus = "active" | "suspended" | "closed";
export type Fund = { id: string; code: string; name: string; restriction: FundRestriction; purpose?: string; startsOn?: string; endsOn?: string; status: FundStatus };
export type FundMovement = { id: string; fundId: string; direction: "credit" | "debit"; amountMinor: number; date: string; sourceType: string; sourceId: string; description: string };
export function validateFund(fund: Fund): string[] {
  const errors: string[] = [];
  if (!fund.code.trim() || !fund.name.trim()) errors.push("FUND_CODE_AND_NAME_REQUIRED");
  if (fund.restriction !== "unrestricted" && !fund.purpose?.trim()) errors.push("FUND_RESTRICTION_PURPOSE_REQUIRED");
  if (fund.startsOn && fund.endsOn && fund.endsOn < fund.startsOn) errors.push("FUND_DATE_RANGE_INVALID");
  return errors;
}
export function validateFundMovement(fund: Fund, movement: FundMovement): string[] {
  const errors: string[] = [];
  if (fund.id !== movement.fundId) errors.push("FUND_MOVEMENT_SCOPE_MISMATCH");
  if (fund.status !== "active") errors.push("FUND_NOT_ACTIVE");
  if (!Number.isSafeInteger(movement.amountMinor) || movement.amountMinor <= 0) errors.push("FUND_MOVEMENT_AMOUNT_INVALID");
  if (!movement.sourceType.trim() || !movement.sourceId.trim() || !movement.description.trim()) errors.push("FUND_MOVEMENT_REFERENCE_REQUIRED");
  if (fund.startsOn && movement.date < fund.startsOn || fund.endsOn && movement.date > fund.endsOn) errors.push("FUND_MOVEMENT_OUTSIDE_VALIDITY");
  return errors;
}
export function calculateFundBalance(fund: Fund, movements: readonly FundMovement[], asOf?: string): number {
  return movements.filter((item) => item.fundId === fund.id && (!asOf || item.date <= asOf))
    .reduce((sum, item) => sum + (item.direction === "credit" ? item.amountMinor : -item.amountMinor), 0);
}
export function assertFundCanBeClosed(fund: Fund, movements: readonly FundMovement[]): void {
  if (calculateFundBalance(fund, movements) !== 0) throw new Error("FUND_BALANCE_MUST_BE_ZERO_TO_CLOSE");
}
