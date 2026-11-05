export type DocumentStatus = "draft" | "under_review" | "approved" | "published" | "superseded" | "archived";
export type AccessLevel = "public" | "internal" | "confidential" | "restricted";
export type DocumentVersion = { version: number; fileChecksum: string; createdAt: string; createdBy: string; changeNote: string };
export type ManagedDocument = { id: string; title: string; classification: string; access: AccessLevel; status: DocumentStatus; ownerId: string; versions: DocumentVersion[]; currentVersion: number; retentionUntil?: string; relatedAggregate?: { type: string; id: string } };

const transitions: Record<DocumentStatus, readonly DocumentStatus[]> = {
  draft: ["under_review", "archived"], under_review: ["draft", "approved", "archived"],
  approved: ["published", "superseded", "archived"], published: ["superseded", "archived"],
  superseded: ["archived"], archived: [],
};
export function transitionDocument(document: ManagedDocument, next: DocumentStatus): ManagedDocument {
  if (!transitions[document.status].includes(next)) throw new Error(`DOCUMENT_TRANSITION_INVALID:${document.status}->${next}`);
  return { ...document, status: next };
}
export function addDocumentVersion(document: ManagedDocument, version: DocumentVersion): ManagedDocument {
  if (document.status === "archived" || document.status === "published") throw new Error("DOCUMENT_VERSION_LOCKED");
  if (!Number.isInteger(version.version) || version.version !== document.currentVersion + 1) throw new Error("DOCUMENT_VERSION_SEQUENCE_INVALID");
  if (!version.fileChecksum.trim() || !version.createdBy.trim() || !version.changeNote.trim()) throw new Error("DOCUMENT_VERSION_METADATA_REQUIRED");
  return { ...document, versions: [...document.versions, version], currentVersion: version.version, status: "draft" };
}
export function canReadDocument(document: ManagedDocument, clearance: AccessLevel): boolean {
  const rank: Record<AccessLevel, number> = { public: 0, internal: 1, confidential: 2, restricted: 3 };
  return rank[clearance] >= rank[document.access];
}
export function validateDocumentRetention(document: ManagedDocument, today: string): string[] {
  const errors: string[] = [];
  if (!document.title.trim() || !document.ownerId.trim() || !document.classification.trim()) errors.push("DOCUMENT_METADATA_REQUIRED");
  if (document.retentionUntil && document.retentionUntil < today && document.status !== "archived") errors.push("DOCUMENT_RETENTION_EXPIRED_REVIEW_REQUIRED");
  if (document.currentVersion !== document.versions.at(-1)?.version) errors.push("DOCUMENT_CURRENT_VERSION_MISMATCH");
  return errors;
}
