import { describe, expect, it } from "vitest";
import { validateBooking, type CalendarBooking } from "./agenda";
describe("agenda e infraestructura", () => {
  it("detecta reservas simultáneas del mismo recurso", () => {
    const current: CalendarBooking = { id: "b1", resourceId: "temple", title: "Misa", startsAt: "2026-11-05T10:00:00", endsAt: "2026-11-05T11:00:00", status: "confirmed", responsibleId: "p1", participantIds: [] };
    const candidate = { ...current, id: "b2", startsAt: "2026-11-05T10:30:00", endsAt: "2026-11-05T11:30:00" };
    expect(validateBooking(candidate, [current])).toContain("BOOKING_RESOURCE_CONFLICT");
  });
});
