import { isIsoCalendarDate, type DomainIssue, type DomainResult } from "../shared/primitives";

export type PastoralActivityStatus = "planned" | "approved" | "open" | "completed" | "cancelled";
export type PastoralActivity = { id: string; programId: string; title: string; objective: string; startsOn: string; endsOn: string; responsibleId: string; capacity?: number; status: PastoralActivityStatus; registeredPersonIds: string[]; attendancePersonIds: string[] };
export type PastoralProgram = { id: string; name: string; pastoralArea: string; annualGoal: number; activities: PastoralActivity[] };

export function validatePastoralActivity(activity: PastoralActivity): DomainResult<PastoralActivity> {
  const errors: DomainIssue[] = [];
  if (!activity.title.trim()) errors.push({ code: "ACTIVITY_TITLE_REQUIRED", field: "title", message: "La actividad requiere un nombre." });
  if (!activity.objective.trim()) errors.push({ code: "ACTIVITY_OBJECTIVE_REQUIRED", field: "objective", message: "La actividad requiere un objetivo pastoral." });
  if (!isIsoCalendarDate(activity.startsOn) || !isIsoCalendarDate(activity.endsOn) || activity.endsOn < activity.startsOn) errors.push({ code: "ACTIVITY_DATES_INVALID", message: "El rango de fechas de la actividad no es válido." });
  if (!activity.responsibleId.trim()) errors.push({ code: "ACTIVITY_RESPONSIBLE_REQUIRED", field: "responsibleId", message: "Debe asignarse un responsable." });
  if (activity.capacity !== undefined && (!Number.isInteger(activity.capacity) || activity.capacity < 1)) errors.push({ code: "ACTIVITY_CAPACITY_INVALID", field: "capacity", message: "La capacidad debe ser un entero positivo." });
  if (new Set(activity.registeredPersonIds).size !== activity.registeredPersonIds.length) errors.push({ code: "DUPLICATE_REGISTRATION", message: "Una persona no puede inscribirse dos veces en la misma actividad." });
  return errors.length ? { ok: false, errors } : { ok: true, value: activity };
}

export function registerParticipant(activity: PastoralActivity, personId: string): PastoralActivity {
  if (activity.status !== "open" && activity.status !== "approved") throw new Error("ACTIVITY_REGISTRATION_CLOSED");
  if (!personId.trim()) throw new Error("PARTICIPANT_ID_REQUIRED");
  if (activity.registeredPersonIds.includes(personId)) throw new Error("PARTICIPANT_ALREADY_REGISTERED");
  if (activity.capacity !== undefined && activity.registeredPersonIds.length >= activity.capacity) throw new Error("ACTIVITY_CAPACITY_REACHED");
  return { ...activity, registeredPersonIds: [...activity.registeredPersonIds, personId] };
}

export function recordAttendance(activity: PastoralActivity, personIds: readonly string[]): PastoralActivity {
  if (activity.status !== "completed") throw new Error("ATTENDANCE_REQUIRES_COMPLETED_ACTIVITY");
  const registered = new Set(activity.registeredPersonIds);
  if (personIds.some((id) => !registered.has(id))) throw new Error("ATTENDANCE_PERSON_NOT_REGISTERED");
  return { ...activity, attendancePersonIds: [...new Set(personIds)] };
}

export function calculateProgramCompletion(program: PastoralProgram): number {
  if (!program.activities.length) return 0;
  return Math.round(program.activities.filter((item) => item.status === "completed").length / program.activities.length * 100);
}
