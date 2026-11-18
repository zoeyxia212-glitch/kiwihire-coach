import { describe, expect, it } from "vitest";
import {
  checkEligibility,
  classifyCandidateStatus,
} from "./eligibilityGate";

const STUDENT = "Student visa with post-study work rights";

function check(jobDescription: string, extra = {}) {
  return checkEligibility({
    jobDescription,
    candidateWorkRights: STUDENT,
    ...extra,
  });
}

describe("classifyCandidateStatus", () => {
  it("recognises citizens and residents", () => {
    expect(classifyCandidateStatus("NZ citizen")).toBe("citizen-or-resident");
    expect(classifyCandidateStatus("Permanent resident")).toBe(
      "citizen-or-resident",
    );
  });

  it("does not treat a pending application as residence", () => {
    expect(classifyCandidateStatus("Student visa, applying for residence"))
      .toBe("needs-permit");
  });

  it("recognises visa holders and blank profiles", () => {
    expect(classifyCandidateStatus(STUDENT)).toBe("needs-permit");
    expect(classifyCandidateStatus("")).toBe("unknown");
    expect(classifyCandidateStatus("TBC")).toBe("unknown");
  });
});

describe("checkEligibility", () => {
  it("skips the check for citizens and residents", () => {
    const result = checkEligibility({
      jobDescription: "Must be a NZ citizen.",
      candidateWorkRights: "NZ citizen",
    });

    expect(result.verdict).toBe("not-needed");
  });

  it("asks for work rights when the profile has none", () => {
    const result = checkEligibility({
      jobDescription: "Junior developer.",
      candidateWorkRights: "",
    });

    expect(result.verdict).toBe("unknown");
  });

  it("fails and quotes a citizenship or residence requirement", () => {
    const result = check(
      "Great graduate role. Applicants must be a NZ citizen or permanent resident. Apply now.",
    );

    expect(result.verdict).toBe("fail");
    expect(result.quote).toBe(
      "Applicants must be a NZ citizen or permanent resident.",
    );
  });

  it("fails on a security clearance requirement", () => {
    const result = check("You will hold or be able to obtain a security clearance.");

    expect(result.verdict).toBe("fail");
    expect(result.quote).toMatch(/security clearance/);
  });

  it("does not fail when citizenship is only preferred", () => {
    const result = check("NZ citizens or permanent residents preferred.");

    expect(result.verdict).toBe("unverified");
    expect(result.notes.join(" ")).toMatch(/preferred, not required/);
  });

  it("passes and notes a general welcome for international applicants", () => {
    const result = check("International applicants are welcome to apply.");

    expect(result.verdict).toBe("pass");
    expect(result.quote).toBe("International applicants are welcome to apply.");
    expect(result.notes.join(" ")).toMatch(/specific role or programme/);
  });

  it("passes without the role-level warning when the permit is named", () => {
    const result = check("Post-study work visa holders are welcome to apply.");

    expect(result.verdict).toBe("pass");
    expect(result.headline).toMatch(/names applicants on your kind of permit/);
    expect(result.notes.join(" ")).not.toMatch(/specific role or programme/);
  });

  it("lets a requirement win over a general welcome", () => {
    const result = check(
      "International applicants welcome. NZ citizenship is required for this role.",
    );

    expect(result.verdict).toBe("fail");
  });

  it("treats silence as unverified, never as a pass", () => {
    const result = check("Build features with React and Spring Boot.");

    expect(result.verdict).toBe("unverified");
    expect(result.quote).toBeNull();
    expect(result.notes.join(" ")).toMatch(/Silence is not permission/);
  });

  it("flags ambiguous right-to-work wording and quotes it", () => {
    const result = check("You must have the right to work in New Zealand.");

    expect(result.verdict).toBe("unverified");
    expect(result.quote).toBe("You must have the right to work in New Zealand.");
    expect(result.notes.join(" ")).toMatch(/citizens and residents only/);
  });

  it("adds a high-risk note for banks and government employers", () => {
    const result = check("Join our bank's graduate technology programme.", {
      company: "Example Bank",
    });

    expect(result.notes.join(" ")).toMatch(/restrict eligibility/);
  });

  it("notes a refusal to sponsor without failing the role", () => {
    const result = check(
      "We are unable to sponsor visas. International applicants are welcome to apply.",
    );

    expect(result.verdict).toBe("pass");
    expect(result.notes.join(" ")).toMatch(/does not offer visa sponsorship/);
  });

  it("uses the recorded sponsorship field only as a labelled fallback", () => {
    const result = check("Build features with React.", {
      sponsorshipAvailable: true,
    });

    expect(result.verdict).toBe("pass");
    expect(result.quote).toBeNull();
    expect(result.notes[0]).toMatch(/field you filled in/);
  });
});
