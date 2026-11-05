import { isIsoCalendarDate, type DomainIssue, type DomainResult } from "../shared/primitives";

export type SacramentKind = "baptism" | "confirmation" | "eucharist" | "marriage" | "anointing" | "orders";
export type SacramentalRequestStatus = "received" | "documents_pending" | "preparation" | "ready" | "scheduled" | "celebrated" | "recorded" | "rejected" | "cancelled";
export type SacramentalRequest = { id: string; kind: SacramentKind; subjectPersonIds: string[]; status: SacramentalRequestStatus; requestedAt: string; scheduledAt?: string; celebrantId?: string; requiredDocumentIds: string[]; verifiedDocumentIds: string[] };
export type SacramentalEntry = { id: string; requestId: string; bookId: string; volume: string; folio: string; entryNumber: string; celebrationDate: string; celebrantId: string; subjectPersonIds: string[]; recordedAt: string; recordedBy: string; sealed: boolean };
export type MarginalNote = { id: string; entryId: string; kind: string; text: string; authorityReference: string; recordedAt: string; recordedBy: string };

const transitions: Record<SacramentalRequestStatus, readonly SacramentalRequestStatus[]> = {
  received: ["documents_pending", "preparation", "rejected", "cancelled"],
  documents_pending: ["preparation", "rejected", "cancelled"],
  preparation: ["ready", "documents_pending", "cancelled"],
  ready: ["scheduled", "cancelled"],
  scheduled: ["celebrated", "ready", "cancelled"],
  celebrated: ["recorded"],
  recorded: [],
  rejected: [],
  cancelled: [],
};

export function transitionSacramentalRequest(request: SacramentalRequest, next: SacramentalRequestStatus): SacramentalRequest {
  if (!transitions[request.status].includes(next)) throw new Error(`SACRAMENTAL_TRANSITION_INVALID:${request.status}->${next}`);
  if (next === "ready" && request.requiredDocumentIds.some((id) => !request.verifiedDocumentIds.includes(id))) throw new Error("SACRAMENTAL_DOCUMENTS_NOT_VERIFIED");
  if (next === "scheduled" && (!request.scheduledAt || !isIsoCalendarDate(request.scheduledAt.slice(0,10)) || !request.celebrantId)) throw new Error("SACRAMENTAL_SCHEDULE_INCOMPLETE");
  return { ...request, status: next };
}

export function validateSacramentalEntry(entry: SacramentalEntry, request: SacramentalRequest): DomainResult<SacramentalEntry> {
  const errors: DomainIssue[] = [];
  if (request.id !== entry.requestId) errors.push({ code: "REQUEST_MISMATCH", message: "La partida debe corresponder a la solicitud que originó la celebración." });
  if (request.status !== "celebrated" && request.status !== "recorded") errors.push({ code: "CELEBRATION_NOT_CONFIRMED", message: "No se puede asentar una partida sin celebración confirmada." });
  if (!isIsoCalendarDate(entry.celebrationDate)) errors.push({ code: "CELEBRATION_DATE_INVALID", field: "celebrationDate", message: "La fecha de celebración no es válida." });
  for (const [field, value] of [["bookId",entry.bookId],["volume",entry.volume],["folio",entry.folio],["entryNumber",entry.entryNumber],["celebrantId",entry.celebrantId],["recordedBy",entry.recordedBy]] as const) if (!value.trim()) errors.push({ code: "REQUIRED_FIELD", field, message: `El campo ${field} es obligatorio.` });
  if (!entry.subjectPersonIds.length) errors.push({ code: "SUBJECT_REQUIRED", field: "subjectPersonIds", message: "Debe existir al menos una persona vinculada a la partida." });
  return errors.length ? { ok: false, errors } : { ok: true, value: entry };
}

export function validateMarginalNote(note: MarginalNote, entry: SacramentalEntry): DomainResult<MarginalNote> {
  const errors: DomainIssue[] = [];
  if (entry.id !== note.entryId) errors.push({ code: "ENTRY_NOT_FOUND", message: "La nota debe referirse a una partida existente." });
  if (entry.sealed && !note.authorityReference.trim()) errors.push({ code: "AUTHORITY_REFERENCE_REQUIRED", message: "Una nota sobre partida cerrada requiere referencia de autorización." });
  if (!note.text.trim() || !note.recordedBy.trim()) errors.push({ code: "NOTE_INCOMPLETE", message: "La nota y su responsable son obligatorios." });
  return errors.length ? { ok: false, errors } : { ok: true, value: note };
}
