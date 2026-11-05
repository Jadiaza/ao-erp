export type LedgerPeriodStatus = "open" | "closed" | "locked";
export type VoucherStatus = "draft" | "posted" | "reversed";

export interface LedgerAccount {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly active: boolean;
  readonly acceptsPostings: boolean;
}
export interface LedgerLineInput {
  readonly accountId: string;
  readonly debitMinor: number;
  readonly creditMinor: number;
  readonly description?: string;
  readonly costCenterId?: string;
  readonly projectId?: string;
  readonly fundId?: string;
}
export interface LedgerVoucherInput {
  readonly id: string;
  readonly organizationId: string;
  readonly accountingEntityId: string;
  readonly periodId: string;
  readonly date: string;
  readonly description: string;
  readonly lines: readonly LedgerLineInput[];
}
export interface LedgerValidationIssue {
  readonly code: "VOUCHER_ID_REQUIRED" | "ORGANIZATION_REQUIRED" | "ACCOUNTING_ENTITY_REQUIRED" | "PERIOD_REQUIRED" | "INVALID_DATE" | "DESCRIPTION_REQUIRED" | "INSUFFICIENT_LINES" | "ACCOUNT_NOT_FOUND" | "ACCOUNT_INACTIVE" | "ACCOUNT_NOT_POSTABLE" | "INVALID_AMOUNT" | "BOTH_SIDES_SET" | "EMPTY_LINE" | "UNBALANCED_VOUCHER" | "PERIOD_NOT_OPEN" | "DATE_OUTSIDE_PERIOD";
  readonly message: string;
  readonly lineIndex?: number;
}
export interface LedgerValidationResult {
  readonly valid: boolean;
  readonly debitMinor: number;
  readonly creditMinor: number;
  readonly issues: readonly LedgerValidationIssue[];
}
export interface LedgerPeriod {
  readonly id: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: LedgerPeriodStatus;
}
const nonNegativeInteger = (value: number) => Number.isSafeInteger(value) && value >= 0;
const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const issue = (code: LedgerValidationIssue["code"], message: string, lineIndex?: number): LedgerValidationIssue => ({ code, message, ...(lineIndex === undefined ? {} : { lineIndex }) });

export function validateVoucher(voucher: LedgerVoucherInput, accounts: readonly LedgerAccount[], period: LedgerPeriod): LedgerValidationResult {
  const issues: LedgerValidationIssue[] = [];
  if (!voucher.id.trim()) issues.push(issue("VOUCHER_ID_REQUIRED", "El comprobante requiere identificador."));
  if (!voucher.organizationId.trim()) issues.push(issue("ORGANIZATION_REQUIRED", "Falta la organización."));
  if (!voucher.accountingEntityId.trim()) issues.push(issue("ACCOUNTING_ENTITY_REQUIRED", "Falta la entidad contable."));
  if (!voucher.periodId.trim() || voucher.periodId !== period.id) issues.push(issue("PERIOD_REQUIRED", "El periodo contable no corresponde al comprobante."));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(voucher.date) || Number.isNaN(Date.parse(voucher.date))) issues.push(issue("INVALID_DATE", "La fecha del comprobante no es válida."));
  if (!voucher.description.trim()) issues.push(issue("DESCRIPTION_REQUIRED", "El concepto del comprobante es obligatorio."));
  if (voucher.lines.length < 2) issues.push(issue("INSUFFICIENT_LINES", "El comprobante debe contener al menos dos movimientos."));
  if (period.status !== "open") issues.push(issue("PERIOD_NOT_OPEN", "Solo se pueden registrar comprobantes en periodos abiertos."));
  if (voucher.date < period.startsOn || voucher.date > period.endsOn) issues.push(issue("DATE_OUTSIDE_PERIOD", "La fecha está fuera del periodo contable."));
  let debitMinor = 0;
  let creditMinor = 0;
  const accountById = new Map(accounts.map(account => [account.id, account]));
  voucher.lines.forEach((line, lineIndex) => {
    if (!nonNegativeInteger(line.debitMinor) || !nonNegativeInteger(line.creditMinor)) {
      issues.push(issue("INVALID_AMOUNT", "Los valores débito y crédito deben ser enteros no negativos.", lineIndex));
      return;
    }
    if (line.debitMinor > 0 && line.creditMinor > 0) issues.push(issue("BOTH_SIDES_SET", "Un movimiento no puede tener débito y crédito simultáneamente.", lineIndex));
    if (line.debitMinor === 0 && line.creditMinor === 0) issues.push(issue("EMPTY_LINE", "Cada movimiento debe tener un débito o un crédito.", lineIndex));
    const account = accountById.get(line.accountId);
    if (!account) issues.push(issue("ACCOUNT_NOT_FOUND", "La cuenta contable no existe en esta entidad.", lineIndex));
    else {
      if (!account.active) issues.push(issue("ACCOUNT_INACTIVE", "La cuenta contable está inactiva.", lineIndex));
      if (!account.acceptsPostings) issues.push(issue("ACCOUNT_NOT_POSTABLE", "La cuenta es de agrupación y no recibe movimientos.", lineIndex));
    }
    debitMinor += line.debitMinor;
    creditMinor += line.creditMinor;
  });
  if (!Number.isSafeInteger(debitMinor) || !Number.isSafeInteger(creditMinor)) issues.push(issue("INVALID_AMOUNT", "El total del comprobante supera el rango entero seguro."));
  else if (debitMinor !== creditMinor) issues.push(issue("UNBALANCED_VOUCHER", "El total débito debe ser igual al total crédito."));
  return { valid: issues.length === 0, debitMinor, creditMinor, issues };
}
export function assertVoucherCanBePosted(voucher: LedgerVoucherInput, accounts: readonly LedgerAccount[], period: LedgerPeriod): LedgerValidationResult {
  const result = validateVoucher(voucher, accounts, period);
  if (!result.valid) throw new LedgerValidationError(result);
  return result;
}
export class LedgerValidationError extends Error {
  readonly result: LedgerValidationResult;
  constructor(result: LedgerValidationResult) {
    super(result.issues.map(entry => entry.message).join(" "));
    this.name = "LedgerValidationError";
    this.result = result;
  }
}
export function createReversalLines(lines: readonly LedgerLineInput[]): LedgerLineInput[] {
  if (lines.length < 2) throw new Error("LEDGER_REVERSAL_REQUIRES_POSTED_LINES");
  return lines.map(line => ({ ...line, debitMinor: line.creditMinor, creditMinor: line.debitMinor, description: line.description ? `Reversión: ${line.description}` : "Reversión" }));
}
export function sumVoucherLines(lines: readonly LedgerLineInput[]): { debitMinor: number; creditMinor: number } {
  return lines.reduce((total, line) => ({ debitMinor: total.debitMinor + line.debitMinor, creditMinor: total.creditMinor + line.creditMinor }), { debitMinor: 0, creditMinor: 0 });
}
