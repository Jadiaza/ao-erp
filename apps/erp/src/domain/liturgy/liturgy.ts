import { isIsoCalendarDate } from "../shared/primitives";\n\nexport type LiturgicalCelebrationStatus = "planned" | "confirmed" | "celebrated" | "cancelled";
export type LiturgicalCelebration = { id: string; date: string; startTime: string; endTime: string; celebrationType: string; locationId: string; presiderId?: string; status: LiturgicalCelebrationStatus; ministers: { personId: string; ministry: string }[] };
export function validateLiturgicalCelebration(item: LiturgicalCelebration, existing: readonly LiturgicalCelebration[]): string[] {
  const errors: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date))) errors.push("LITURGY_DATE_INVALID");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(item.startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.endTime) || item.endTime <= item.startTime) errors.push("LITURGY_TIME_RANGE_INVALID");
  if (!item.celebrationType.trim() || !item.locationId.trim()) errors.push("LITURGY_REQUIRED_FIELDS_MISSING");
  if (item.status === "confirmed" && !item.presiderId?.trim()) errors.push("LITURGY_PRESIDER_REQUIRED");
  const overlaps = existing.some((other) => other.id !== item.id && other.date === item.date && other.locationId === item.locationId && other.status !== "cancelled" && item.status !== "cancelled" && item.startTime < other.endTime && item.endTime > other.startTime);
  if (overlaps) errors.push("LITURGY_LOCATION_CONFLICT");
  const assigned = item.ministers.map((minister) => `${minister.personId}:${minister.ministry}`);
  if (new Set(assigned).size !== assigned.length) errors.push("LITURGY_DUPLICATE_MINISTRY_ASSIGNMENT");
  return errors;
}
