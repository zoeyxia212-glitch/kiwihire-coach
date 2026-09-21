import { describe, expect, it } from "vitest";
import type { Application } from "../types/application";
import { buildApplicationsCsv } from "./applicationCsv";

const application: Application = {
  id: 1, company: 'Example, "NZ" Ltd', roleTitle: "Graduate Developer",
  location: "Auckland", status: "Applied", jobDescription: "Java role",
  closingDate: null, createdAt: "2026-09-01T10:00:00", userId: 1,
  userEmail: "zoey@example.com", source: "SEEK", workMode: "Hybrid",
  workRightsRequirement: null, salaryRange: null, contactPerson: null,
  jobUrl: null, careerLevel: "Graduate", employmentType: "Full-time",
  graduateFriendly: true, sponsorshipAvailable: null, industry: "Technology",
  decision: "Pursue", decisionReason: "Strong fit", strongestFit: "Java",
  mainConcern: "Experience", coverLetterDraft: "Dear hiring team",
  evidenceItemIds: [], applicationAnswerIds: [],
  submittedAt: "2026-09-02T09:00:00", archived: false,
};

describe("buildApplicationsCsv", () => {
  it("exports outcome and material-readiness fields", () => {
    const csv = buildApplicationsCsv([application]);
    expect(csv).toContain('"Submitted at"');
    expect(csv).toContain('"Decision reason"');
    expect(csv).toContain('"Cover letter saved"');
    expect(csv).toContain('"2026-09-02T09:00:00"');
  });

  it("escapes CSV values without exposing document contents", () => {
    const csv = buildApplicationsCsv([application]);
    expect(csv).toContain('"Example, ""NZ"" Ltd"');
    expect(csv).not.toContain("Java role");
    expect(csv).not.toContain("Dear hiring team");
  });

  it("prevents spreadsheet formula injection", () => {
    const csv = buildApplicationsCsv([{
      ...application,
      company: "=HYPERLINK(\"https://example.com\")",
      roleTitle: "  +SUM(1,1)",
    }]);

    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'  +SUM(1,1)");
    expect(csv).not.toContain('"=HYPERLINK');
  });
});
