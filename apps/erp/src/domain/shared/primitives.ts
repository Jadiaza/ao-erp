export type DomainResult<T, TCode extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly DomainIssue<TCode>[] };

export interface DomainIssue<TCode extends string = string> {
  readonly code: TCode;
  readonly message: string;
  readonly field?: string;
}

export interface DomainEvent<TPayload = unknown> {
  readonly id: string;
  readonly type: string;
  readonly occurredAt: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly payload: TPayload;
}

export interface AuditMetadata {
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt?: string;
  readonly updatedBy?: string;
}

export type LifecycleStatus =
  | "draft"
  | "pending"
  | "active"
  | "approved"
  | "rejected"
  | "cancelled"
  | "closed"
  | "archived";

export interface StateTransition<TStatus extends string> {
  readonly from: TStatus;
  readonly to: TStatus;
  readonly allowedRoles?: readonly string[];
}

export function canTransition<TStatus extends string>(
  current: TStatus,
  target: TStatus,
  transitions: readonly StateTransition<TStatus>[],
): boolean {
  return transitions.some((transition) => transition.from === current && transition.to === target);
}

export function assertTransition<TStatus extends string>(
  current: TStatus,
  target: TStatus,
  transitions: readonly StateTransition<TStatus>[],
  aggregateName: string,
): void {
  if (!canTransition(current, target, transitions)) {
    throw new Error(`AO_INVALID_STATE_TRANSITION:${aggregateName}:${current}->${target}`);
  }
}

/** COP and other currencies are represented in their minor unit as integers. */
export interface Money {
  readonly amountMinor: number;
  readonly currency: string;
}

export function money(amountMinor: number, currency = "COP"): Money {
  if (!Number.isSafeInteger(amountMinor)) throw new Error("AO_MONEY_AMOUNT_MUST_BE_SAFE_INTEGER");
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("AO_MONEY_CURRENCY_INVALID");
  return { amountMinor, currency };
}

export function addMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) throw new Error("AO_MONEY_CURRENCY_MISMATCH");
  return money(left.amountMinor + right.amountMinor, left.currency);
}

export function subtractMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) throw new Error("AO_MONEY_CURRENCY_MISMATCH");
  return money(left.amountMinor - right.amountMinor, left.currency);
}

export function isIsoCalendarDate(value: string): boolean {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) throw new Error(`AO_REQUIRED_FIELD:${field}`);
}
