export type AuditAction = "create" | "read" | "update" | "delete" | "approve" | "post" | "export" | "login" | "permission_change";
export type AuditRecord = { id: string; organizationId: string; actorId: string; action: AuditAction; resourceType: string; resourceId: string; occurredAt: string; correlationId: string; beforeHash?: string; afterHash?: string; reason?: string };
export function validateAuditRecord(record: AuditRecord): string[] {
  const errors: string[] = [];
  if (!record.organizationId.trim() || !record.actorId.trim() || !record.resourceType.trim() || !record.resourceId.trim()) errors.push("AUDIT_CONTEXT_REQUIRED");
  if (!record.correlationId.trim()) errors.push("AUDIT_CORRELATION_REQUIRED");
  if (!Number.isFinite(Date.parse(record.occurredAt))) errors.push("AUDIT_TIMESTAMP_INVALID");
  if (record.action === "delete" && !record.reason?.trim()) errors.push("AUDIT_DELETE_REASON_REQUIRED");
  if (record.action === "permission_change" && (!record.beforeHash || !record.afterHash)) errors.push("AUDIT_PERMISSION_DIFF_REQUIRED");
  return errors;
}
export function assertAuditChain(records: readonly AuditRecord[]): void {
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error("AUDIT_DUPLICATE_RECORD");
    ids.add(record.id);
  }
  for (let index = 1; index < records.length; index++) {
    if (records[index].occurredAt < records[index - 1].occurredAt) throw new Error("AUDIT_CHAIN_ORDER_INVALID");
  }
}
