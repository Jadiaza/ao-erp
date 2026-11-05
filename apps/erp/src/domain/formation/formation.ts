export type FormationEnrollmentStatus = "requested" | "enrolled" | "in_progress" | "completed" | "withdrawn";
export type FormationCourse = { id: string; name: string; startsOn: string; endsOn: string; capacity?: number; requiredSessions: number; completedSessionIds: string[] };
export type FormationEnrollment = { id: string; courseId: string; personId: string; status: FormationEnrollmentStatus; attendanceSessionIds: string[]; assessmentPassed: boolean };

export function enrollParticipant(course: FormationCourse, enrollments: readonly FormationEnrollment[], personId: string): FormationEnrollment {
  if (!personId.trim()) throw new Error("FORMATION_PERSON_REQUIRED");
  if (enrollments.some((item) => item.courseId === course.id && item.personId === personId && item.status !== "withdrawn")) throw new Error("FORMATION_DUPLICATE_ENROLLMENT");
  const active = enrollments.filter((item) => item.courseId === course.id && item.status !== "withdrawn").length;
  if (course.capacity !== undefined && active >= course.capacity) throw new Error("FORMATION_CAPACITY_REACHED");
  return { id: `ENR-${course.id}-${personId}`, courseId: course.id, personId, status: "enrolled", attendanceSessionIds: [], assessmentPassed: false };
}
export function completeFormation(enrollment: FormationEnrollment, course: FormationCourse, minimumAttendanceRatio = 0.8): FormationEnrollment {
  if (enrollment.status !== "in_progress") throw new Error("FORMATION_NOT_IN_PROGRESS");
  if (minimumAttendanceRatio < 0 || minimumAttendanceRatio > 1) throw new Error("FORMATION_ATTENDANCE_THRESHOLD_INVALID");
  const total = course.completedSessionIds.length;
  const attended = new Set(enrollment.attendanceSessionIds.filter((id) => course.completedSessionIds.includes(id))).size;
  if (!total || attended / total < minimumAttendanceRatio || !enrollment.assessmentPassed) throw new Error("FORMATION_COMPLETION_REQUIREMENTS_NOT_MET");
  return { ...enrollment, status: "completed" };
}
