import { describe, expect, it } from "vitest";
import { validateLiturgicalCelebration, type LiturgicalCelebration } from "./liturgy";
describe("liturgia", () => {
  it("evita solapamiento de celebraciones en una misma sede", () => {
    const existing: LiturgicalCelebration = { id: "m1", date: "2026-11-05", startTime: "10:00", endTime: "11:00", celebrationType: "Eucaristía", locationId: "temple", presiderId: "p1", status: "confirmed", ministers: [] };
    const next = { ...existing, id: "m2", startTime: "10:30", endTime: "11:30" };
    expect(validateLiturgicalCelebration(next, [existing])).toContain("LITURGY_LOCATION_CONFLICT");
  });
});
