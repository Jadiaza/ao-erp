export type AgendaStatus = "tentative" | "confirmed" | "completed" | "cancelled";
export type CalendarBooking = { id: string; resourceId: string; title: string; startsAt: string; endsAt: string; status: AgendaStatus; responsibleId: string; participantIds: string[] };
export function validateBooking(booking: CalendarBooking, existing: readonly CalendarBooking[]): string[] {
  const errors: string[] = [];
  const start = Date.parse(booking.startsAt), end = Date.parse(booking.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) errors.push("BOOKING_TIME_RANGE_INVALID");
  if (!booking.resourceId.trim() || !booking.title.trim() || !booking.responsibleId.trim()) errors.push("BOOKING_REQUIRED_FIELDS_MISSING");
  if (new Set(booking.participantIds).size !== booking.participantIds.length) errors.push("BOOKING_DUPLICATE_PARTICIPANT");
  const collision = existing.some((item) => item.id !== booking.id && item.resourceId === booking.resourceId && item.status !== "cancelled" && booking.status !== "cancelled" && start < Date.parse(item.endsAt) && end > Date.parse(item.startsAt));
  if (collision) errors.push("BOOKING_RESOURCE_CONFLICT");
  return errors;
}
export function confirmBooking(booking: CalendarBooking, existing: readonly CalendarBooking[]): CalendarBooking {
  if (booking.status !== "tentative") throw new Error("BOOKING_NOT_TENTATIVE");
  const errors = validateBooking({ ...booking, status: "confirmed" }, existing);
  if (errors.length) throw new Error(errors.join("|"));
  return { ...booking, status: "confirmed" };
}
