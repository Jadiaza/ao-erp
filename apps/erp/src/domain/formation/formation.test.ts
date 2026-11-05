import { describe, expect, it } from "vitest";
import { completeFormation, enrollParticipant, type FormationCourse, type FormationEnrollment } from "./formation";
const course: FormationCourse = { id: "c1", name: "Catequesis", startsOn: "2026-01-01", endsOn: "2026-06-01", capacity: 2, requiredSessions: 3, completedSessionIds: ["s1","s2","s3"] };
describe("formación", () => {
  it("evita inscripciones duplicadas", () => {
    const existing: FormationEnrollment[] = [{ id: "e1", courseId: "c1", personId: "p1", status: "enrolled", attendanceSessionIds: [], assessmentPassed: false }];
    expect(() => enrollParticipant(course, existing, "p1")).toThrow("FORMATION_DUPLICATE_ENROLLMENT");
  });
  it("exige asistencia y evaluación para certificar", () => {
    const enrollment: FormationEnrollment = { id: "e1", courseId: "c1", personId: "p1", status: "in_progress", attendanceSessionIds: ["s1","s2","s3"], assessmentPassed: true };
    expect(completeFormation(enrollment, course).status).toBe("completed");
  });
});
