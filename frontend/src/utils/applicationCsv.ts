import type { Application } from "../types/application";

export function buildApplicationsCsv(applications: Application[]) {
  const headers = [
    "Company", "Role title", "Location", "Status", "Source", "Work mode",
    "Work rights requirement", "Salary range", "Contact person", "Career level",
    "Employment type", "Graduate friendly", "Visa sponsorship available",
    "Industry", "Closing date", "Job URL", "Created at", "Submitted at",
    "Decision", "Decision reason", "Strongest fit", "Main concern",
    "Cover letter saved", "Submission snapshot", "Archived",
  ];
  const rows = applications.map((application) => [
    application.company, application.roleTitle, application.location,
    application.status, application.source, application.workMode,
    application.workRightsRequirement, application.salaryRange,
    application.contactPerson, application.careerLevel,
    application.employmentType, optionalBoolean(application.graduateFriendly),
    optionalBoolean(application.sponsorshipAvailable), application.industry,
    application.closingDate, application.jobUrl, application.createdAt,
    application.submittedAt, application.decision, application.decisionReason,
    application.strongestFit, application.mainConcern,
    application.coverLetterDraft?.trim() ? "Yes" : "No",
    application.submittedAt ? "Yes" : "No",
    application.archived ? "Yes" : "No",
  ]);

  return [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
}

function optionalBoolean(value: boolean | null) {
  if (value === null) return "Unknown";
  return value ? "Yes" : "No";
}

function csvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  const spreadsheetSafeText = /^[\t\r ]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;
  return `"${spreadsheetSafeText.replace(/"/g, '""')}"`;
}
