import { isIsoCalendarDate } from "../shared/primitives";
export type ReceivableStatus = "draft" | "issued" | "partially_collected" | "collected" | "cancelled";
export type Receivable = { id: string; debtorId: string; concept: string; issueDate: string; dueDate: string; currency: string; totalMinor: number; collectedMinor: number; status: ReceivableStatus; sourceType: "service" | "rental" | "other"; sourceId?: string };
export type Collection = { id: string; receivableId: string; amountMinor: number; collectedOn: string; cashMovementId: string; reference: string };
export function validateReceivable(item: Receivable): string[] {
  const errors: string[] = [];
  if (!item.id.trim() || !item.debtorId.trim() || !item.concept.trim()) errors.push("RECEIVABLE_ID_DEBTOR_AND_CONCEPT_REQUIRED");
  if (!isIsoCalendarDate(item.issueDate) || !isIsoCalendarDate(item.dueDate) || item.dueDate < item.issueDate) errors.push("RECEIVABLE_DUE_DATE_INVALID");
  if (!Number.isSafeInteger(item.totalMinor) || item.totalMinor <= 0 || !Number.isSafeInteger(item.collectedMinor) || item.collectedMinor < 0 || item.collectedMinor > item.totalMinor) errors.push("RECEIVABLE_AMOUNT_INVALID");
  if (!/^[A-Z]{3}$/.test(item.currency)) errors.push("RECEIVABLE_CURRENCY_INVALID");
  return errors;
}
export function issueReceivable(item: Receivable): Receivable {
  if (item.status !== "draft" || validateReceivable(item).length) throw new Error("RECEIVABLE_CANNOT_BE_ISSUED");
  return { ...item, status: "issued" };
}
export function registerCollection(item: Receivable, collection: Collection): Receivable {
  if (item.status !== "issued" && item.status !== "partially_collected") throw new Error("RECEIVABLE_NOT_COLLECTIBLE");
  if (!collection.id.trim() || collection.receivableId !== item.id || !collection.cashMovementId.trim() || !collection.reference.trim() || !isIsoCalendarDate(collection.collectedOn)) throw new Error("COLLECTION_REFERENCE_INVALID");
  if (!Number.isSafeInteger(collection.amountMinor) || collection.amountMinor <= 0 || item.collectedMinor + collection.amountMinor > item.totalMinor) throw new Error("COLLECTION_AMOUNT_INVALID");
  const collectedMinor = item.collectedMinor + collection.amountMinor;
  return { ...item, collectedMinor, status: collectedMinor === item.totalMinor ? "collected" : "partially_collected" };
}