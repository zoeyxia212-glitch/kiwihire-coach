import { describe, expect, it } from "vitest";
import { buildSubmitChecks, submitBlockers } from "./submitChecks";

const base = {
  status: "Saved",
  closingDate: null,
  jobDescription: "Junior developer. Build React features.",
  workRightsRequirement: null,
  sponsorshipAvailable: null,
  company: "Kiwi Tech",
  industry: null,
  coverLetterDraft: "I built dashboards with React.",
};
const profile = {
  workRights: "Student visa with post-study work rights",
  spokenLanguages: "English, Mandarin",
};

function run(overrides = {}, extra = {}) {
  return buildSubmitChecks({
    application: { ...base, ...overrides },
    profile,
    groundingSources: ["React, TypeScript"],
    hasCvReview: true,
    today: new Date(2026, 10, 18),
    ...extra,
  });
}

const byKey = (checks: ReturnType<typeof run>, key: string) =>
  checks.find((check) => check.key === key)!;

describe("buildSubmitChecks", () => {
  it("fails a role whose closing date has passed", () => {
    const checks = run({ closingDate: "2026-11-01" });
    expect(byKey(checks, "deadline").status).toBe("fail");
    expect(submitBlockers(checks).map((c) => c.key)).toContain("deadline");
  });

  it("warns when the role closes within a week", () => {
    expect(byKey(run({ closingDate: "2026-11-20" }), "deadline").status).toBe(
      "warn",
    );
  });

  it("fails a citizen only role for a visa holder", () => {
    const checks = run({
      jobDescription: "Applicants must be a NZ citizen or permanent resident.",
    });
    expect(byKey(checks, "eligibility").status).toBe("fail");
  });

  it("fails a demanding language that is not on the profile", () => {
    const checks = run({
      jobDescription: "You must be fluent in Japanese.",
    });
    expect(byKey(checks, "language").status).toBe("fail");
  });

  it("warns about an unchecked language when none is saved", () => {
    const checks = run(
      { jobDescription: "You must be fluent in Japanese." },
      { profile: { workRights: "NZ citizen", spokenLanguages: "" } },
    );
    expect(byKey(checks, "language").status).toBe("warn");
  });

  it("warns about unsupported skills in the letter", () => {
    const checks = run({
      coverLetterDraft: "I run production workloads on Kubernetes.",
    });
    const claims = byKey(checks, "claims");
    expect(claims.status).toBe("warn");
    expect(claims.detail).toContain("Kubernetes");
  });

  it("passes a clean role with no blockers", () => {
    const checks = run();
    expect(submitBlockers(checks)).toEqual([]);
    expect(byKey(checks, "claims").status).toBe("pass");
  });
});
