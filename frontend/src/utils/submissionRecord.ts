import type { Application } from "../types/application";

export function downloadSubmissionRecord(application: Application) {
  if (!application.submittedAt) {
    return;
  }

  const lines = [
    "# KiwiHire Submission Record",
    "",
    `- Company: ${application.company}`,
    `- Role: ${application.roleTitle}`,
    `- Submitted: ${formatDateTime(application.submittedAt)}`,
    `- Status: ${application.status}`,
    `- Source: ${application.source || "Not recorded"}`,
    `- Job URL: ${application.jobUrl || "Not recorded"}`,
    `- CV version: ${application.submittedResumeName || "Not recorded"}`,
    "",
    "## Job description",
    "",
    application.submittedJobDescription || "No job description was saved.",
    "",
    `## Submitted CV · ${application.submittedResumeName || "Unknown version"}`,
    "",
    application.submittedResumeContent || "No CV content was saved.",
    "",
    "## Application answers",
    "",
    application.submittedAnswers || "No application answers were attached.",
    "",
    "## Selected evidence",
    "",
    application.submittedEvidence || "No evidence items were attached.",
    "",
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = [
    "kiwihire-submission",
    filenamePart(application.company),
    filenamePart(application.roleTitle),
    application.submittedAt.slice(0, 10),
  ].join("-") + ".md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function filenamePart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "record";
}
