export type ReportSectionStatus = "empty" | "in_progress" | "ready" | "approved";
export type ReportSection = { id: string; title: string; sourceModule: string; status: ReportSectionStatus; sourceRecordIds: string[]; reviewedBy?: string; reviewedAt?: string };
export type ParishAnnualReport = { id: string; parishId: string; year: number; status: "draft" | "in_review" | "submitted" | "returned" | "accepted"; sections: ReportSection[]; submittedAt?: string; submissionReference?: string };

export function validateAnnualReport(report: ParishAnnualReport): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(report.year) || report.year < 1900 || report.year > 2200) errors.push("REPORT_YEAR_INVALID");
  if (!report.parishId.trim()) errors.push("REPORT_PARISH_REQUIRED");
  if (!report.sections.length) errors.push("REPORT_SECTIONS_REQUIRED");
  for (const section of report.sections) {
    if (!section.title.trim() || !section.sourceModule.trim()) errors.push(`REPORT_SECTION_METADATA_REQUIRED:${section.id}`);
    if (section.status === "approved" && (!section.reviewedBy || !section.reviewedAt)) errors.push(`REPORT_SECTION_REVIEW_METADATA_REQUIRED:${section.id}`);
  }
  return errors;
}
export function submitAnnualReport(report: ParishAnnualReport, submittedAt: string, reference: string): ParishAnnualReport {
  if (report.status !== "draft" && report.status !== "returned") throw new Error("REPORT_NOT_SUBMITTABLE");
  if (validateAnnualReport(report).length) throw new Error("REPORT_VALIDATION_FAILED");
  if (report.sections.some((section) => section.status !== "approved")) throw new Error("REPORT_SECTIONS_NOT_APPROVED");
  if (!submittedAt.trim() || !reference.trim()) throw new Error("REPORT_SUBMISSION_METADATA_REQUIRED");
  return { ...report, status: "submitted", submittedAt, submissionReference: reference };
}
export function returnAnnualReport(report: ParishAnnualReport, observation: string): ParishAnnualReport {
  if (report.status !== "submitted") throw new Error("REPORT_NOT_SUBMITTED");
  if (!observation.trim()) throw new Error("REPORT_RETURN_OBSERVATION_REQUIRED");
  return { ...report, status: "returned" };
}
