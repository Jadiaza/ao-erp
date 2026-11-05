import { isIsoCalendarDate } from "../shared/primitives";
export type PayableStatus = "draft" | "approved" | "partially_paid" | "paid" | "voided";
export type Payable = { id: string; supplierId: string; invoiceNumber: string; issueDate: string; dueDate: string; currency: string; totalMinor: number; paidMinor: number; status: PayableStatus; purchaseOrderId?: string };
export type PayablePayment = { id: string; payableId: string; amountMinor: number; paidOn: string; cashMovementId: string; reference: string };
export function validatePayable(payable: Payable): string[] {
  const errors: string[] = [];
  if (!payable.id.trim() || !payable.supplierId.trim() || !payable.invoiceNumber.trim()) errors.push("PAYABLE_ID_SUPPLIER_AND_INVOICE_REQUIRED");
  if (!isIsoCalendarDate(payable.issueDate) || !isIsoCalendarDate(payable.dueDate) || payable.dueDate < payable.issueDate) errors.push("PAYABLE_DUE_DATE_INVALID");
  if (!Number.isSafeInteger(payable.totalMinor) || payable.totalMinor <= 0) errors.push("PAYABLE_TOTAL_INVALID");
  if (!Number.isSafeInteger(payable.paidMinor) || payable.paidMinor < 0 || payable.paidMinor > payable.totalMinor) errors.push("PAYABLE_PAID_AMOUNT_INVALID");
  if (!/^[A-Z]{3}$/.test(payable.currency)) errors.push("PAYABLE_CURRENCY_INVALID");
  return errors;
}
export function approvePayable(payable: Payable): Payable {
  if (payable.status !== "draft") throw new Error("PAYABLE_NOT_DRAFT");
  if (validatePayable(payable).length) throw new Error("PAYABLE_VALIDATION_FAILED");
  return { ...payable, status: "approved" };
}
export function registerPayablePayment(payable: Payable, payment: PayablePayment): { payable: Payable; payment: PayablePayment } {
  if (payable.status !== "approved" && payable.status !== "partially_paid") throw new Error("PAYABLE_NOT_PAYABLE");
  if (!payment.id.trim() || payment.payableId !== payable.id || !payment.cashMovementId.trim() || !payment.reference.trim() || !isIsoCalendarDate(payment.paidOn)) throw new Error("PAYABLE_PAYMENT_REFERENCE_INVALID");
  if (!Number.isSafeInteger(payment.amountMinor) || payment.amountMinor <= 0 || payable.paidMinor + payment.amountMinor > payable.totalMinor) throw new Error("PAYABLE_PAYMENT_AMOUNT_INVALID");
  const paidMinor = payable.paidMinor + payment.amountMinor;
  return { payable: { ...payable, paidMinor, status: paidMinor === payable.totalMinor ? "paid" : "partially_paid" }, payment };
}