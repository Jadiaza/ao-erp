export type PurchaseRequestStatus = "draft" | "submitted" | "approved" | "ordered" | "partially_received" | "received" | "cancelled";
export type PurchaseLine = { id: string; description: string; quantity: number; unitPriceMinor: number; receivedQuantity: number; expenseAccountCode: string; costCenterId: string };
export type PurchaseRequest = { id: string; requesterId: string; supplierId?: string; status: PurchaseRequestStatus; lines: PurchaseLine[]; approvedBy?: string; purchaseOrderReference?: string };

export function purchaseLineTotal(line: PurchaseLine): number {
  if (!Number.isSafeInteger(line.quantity) || line.quantity <= 0 || !Number.isSafeInteger(line.unitPriceMinor) || line.unitPriceMinor < 0) throw new Error("PURCHASE_LINE_AMOUNT_INVALID");
  return line.quantity * line.unitPriceMinor;
}
export function purchaseTotal(request: PurchaseRequest): number {
  return request.lines.reduce((sum, line) => sum + purchaseLineTotal(line), 0);
}
export function validatePurchaseRequest(request: PurchaseRequest): string[] {
  const errors: string[] = [];
  if (!request.requesterId.trim()) errors.push("PURCHASE_REQUESTER_REQUIRED");
  if (!request.lines.length) errors.push("PURCHASE_LINES_REQUIRED");
  for (const line of request.lines) {
    if (!line.description.trim() || !line.expenseAccountCode.trim() || !line.costCenterId.trim()) errors.push(`PURCHASE_LINE_DIMENSIONS_REQUIRED:${line.id}`);
    if (!Number.isInteger(line.receivedQuantity) || line.receivedQuantity < 0 || line.receivedQuantity > line.quantity) errors.push(`PURCHASE_RECEIVED_QUANTITY_INVALID:${line.id}`);
  }
  return errors;
}
export function approvePurchaseRequest(request: PurchaseRequest, approverId: string): PurchaseRequest {
  if (request.status !== "submitted") throw new Error("PURCHASE_REQUEST_NOT_SUBMITTED");
  if (!approverId.trim() || approverId === request.requesterId) throw new Error("PURCHASE_APPROVER_INVALID");
  if (validatePurchaseRequest(request).length) throw new Error("PURCHASE_REQUEST_INVALID");
  return { ...request, status: "approved", approvedBy: approverId };
}
export function issuePurchaseOrder(request: PurchaseRequest, reference: string): PurchaseRequest {
  if (request.status !== "approved") throw new Error("PURCHASE_REQUEST_NOT_APPROVED");
  if (!request.supplierId?.trim() || !reference.trim()) throw new Error("PURCHASE_ORDER_DATA_REQUIRED");
  return { ...request, status: "ordered", purchaseOrderReference: reference };
}
export function receivePurchaseItems(request: PurchaseRequest, received: Readonly<Record<string, number>>): PurchaseRequest {
  if (request.status !== "ordered" && request.status !== "partially_received") throw new Error("PURCHASE_ORDER_NOT_OPEN_FOR_RECEIPT");
  const lines = request.lines.map((line) => {
    const qty = received[line.id] ?? 0;
    if (!Number.isInteger(qty) || qty < 0 || line.receivedQuantity + qty > line.quantity) throw new Error(`PURCHASE_RECEIPT_QUANTITY_INVALID:${line.id}`);
    return { ...line, receivedQuantity: line.receivedQuantity + qty };
  });
  const complete = lines.every((line) => line.receivedQuantity === line.quantity);
  const any = lines.some((line) => line.receivedQuantity > 0);
  return { ...request, lines, status: complete ? "received" : any ? "partially_received" : request.status };
}
