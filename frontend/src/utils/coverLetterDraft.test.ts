import { describe, expect, it } from "vitest";
import { buildCoverLetterDraft, reviewCoverLetterDraft } from "./coverLetterDraft";

describe("buildCoverLetterDraft", () => {
  it("uses only the supplied role, motivation and evidence", () => {
    const draft = buildCoverLetterDraft({
      company: "Xero",
      roleTitle: "Graduate Developer",
      hiringManagerName: "Aroha",
      candidateName: "Zoey Xia",
      motivation: "I value products that help small businesses.",
      evidenceItems: [{
        id: 1,
        title: "API project",
        context: "In my KiwiHire project",
        action: "Built authenticated REST APIs",
        result: "a secure user-specific workflow",
        skills: "Java, Spring Boot",
        sourceLearningGoalId: null,
        createdAt: "2026-09-07T10:00:00",
        updatedAt: "2026-09-07T10:00:00",
      }],
    });

    expect(draft).toContain("Dear Aroha,");
    expect(draft).toContain("Graduate Developer position at Xero");
    expect(draft).toContain("I value products that help small businesses.");
    expect(draft).toContain("built authenticated REST APIs");
    expect(draft).toContain("a secure user-specific workflow");
    expect(draft).toContain("Kind regards,\nZoey Xia");
  });

  it("does not invent evidence when none is selected", () => {
    const draft = buildCoverLetterDraft({
      company: "Datacom",
      roleTitle: "Junior Developer",
      hiringManagerName: "",
      motivation: "",
      evidenceItems: [],
    });

    expect(draft).toContain("Dear Datacom hiring team,");
    expect(draft).not.toContain("For example");
  });
});

describe("reviewCoverLetterDraft", () => {
  it("identifies role-specific evidence and a finished signature", () => {
    const draft = [
      "I am applying for the Graduate Developer role at Xero.",
      "I built and tested a Spring Boot API that reduced manual work by 20%.",
      ...Array.from({ length: 20 }, () => "I communicated decisions and delivered maintainable software with my team."),
      "Kind regards, Zoey Xia",
    ].join(" ");

    const checks = reviewCoverLetterDraft(draft, "Xero", "Graduate Developer");

    expect(checks.every((check) => check.passed)).toBe(true);
  });

  it("flags a short generic draft with a placeholder", () => {
    const checks = reviewCoverLetterDraft(
      "I would like this job. Kind regards, [Your name]",
      "Xero",
      "Graduate Developer",
    );

    expect(checks.filter((check) => !check.passed).map((check) => check.label))
      .toEqual([
        "Names the company",
        "Names the role",
        "Uses concrete evidence",
        "Has a practical length",
        "Removes placeholders",
      ]);
  });
});
