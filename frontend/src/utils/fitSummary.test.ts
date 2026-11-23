import { describe, expect, it } from "vitest";
import {
  bandForScore,
  buildFitSummary,
  type FitApplication,
  type FitProfile,
} from "./fitSummary";
import type { ResumeAnalysis } from "../types/resumeAnalysis";

const analysis = (score: number | null): ResumeAnalysis => ({
  score,
  matched: [],
  missing: [],
  transferable: [],
  suggestions: [],
});

const application: FitApplication = {
  company: "Example Ltd",
  roleTitle: "Junior Software Developer",
  jobDescription: "Build features with React. International applicants welcome.",
  location: "Auckland CBD",
  workMode: "Hybrid",
  careerLevel: "Junior",
  graduateFriendly: null,
  sponsorshipAvailable: null,
  workRightsRequirement: null,
  industry: "Software",
};

const profile: FitProfile = {
  targetRoles: "Junior Software Engineer, Full Stack Developer",
  workRights: "Student visa with post-study work rights",
  preferredLocations: "Auckland",
  careerStage: "Graduate",
};

describe("bandForScore", () => {
  it("maps scores to bands at the thresholds", () => {
    expect(bandForScore(75)).toBe("strong");
    expect(bandForScore(74)).toBe("good");
    expect(bandForScore(60)).toBe("good");
    expect(bandForScore(59)).toBe("moderate");
    expect(bandForScore(45)).toBe("moderate");
    expect(bandForScore(44)).toBe("weak");
    expect(bandForScore(30)).toBe("weak");
    expect(bandForScore(29)).toBe("poor");
  });
});

describe("buildFitSummary", () => {
  it("weights skills, role alignment and level fit", () => {
    const result = buildFitSummary({
      analysis: analysis(80),
      application,
      profile,
    });
    const byKey = Object.fromEntries(
      result.dimensions.map((dimension) => [dimension.key, dimension.score]),
    );

    // "developer" is treated as "engineer", so the title fully matches.
    expect(byKey.role).toBe(100);
    // A junior role is one level above a graduate.
    expect(byKey.level).toBe(60);
    // (80*50 + 100*30 + 60*20) / 100
    expect(result.overall).toBe(82);
    expect(result.band).toBe("strong");
    expect(result.scored).toBe(true);
    expect(result.gate.verdict).toBe("pass");
  });

  it("rebalances weights instead of counting missing data as zero", () => {
    const result = buildFitSummary({
      analysis: analysis(80),
      application,
      profile: { ...profile, targetRoles: "", careerStage: "" },
    });

    expect(result.overall).toBe(80);
  });

  it("does not score a role that fails the eligibility gate", () => {
    const result = buildFitSummary({
      analysis: analysis(95),
      application: {
        ...application,
        jobDescription: "You must be a NZ citizen or permanent resident.",
      },
      profile,
    });

    expect(result.gate.verdict).toBe("fail");
    expect(result.scored).toBe(false);
    expect(result.overall).toBeNull();
    expect(result.band).toBeNull();
    expect(result.advice).toMatch(/Not scored/);
  });

  it("does not score without a skills result", () => {
    const result = buildFitSummary({
      analysis: analysis(null),
      application,
      profile,
    });

    expect(result.scored).toBe(false);
    expect(result.overall).toBeNull();
  });

  it("scores a graduate-friendly role as a full level fit", () => {
    const result = buildFitSummary({
      analysis: analysis(50),
      application: { ...application, graduateFriendly: true },
      profile,
    });
    const level = result.dimensions.find((item) => item.key === "level");

    expect(level?.score).toBe(100);
  });

  it("scores levels further above the candidate lower", () => {
    const levelScore = (careerLevel: string) =>
      buildFitSummary({
        analysis: analysis(50),
        application: { ...application, careerLevel },
        profile,
      }).dimensions.find((item) => item.key === "level")?.score;

    expect(levelScore("Intermediate")).toBe(25);
    expect(levelScore("Senior")).toBe(0);
  });

  it("reports a location mismatch without changing the score", () => {
    const here = buildFitSummary({ analysis: analysis(80), application, profile });
    const away = buildFitSummary({
      analysis: analysis(80),
      application: { ...application, location: "Wellington" },
      profile,
    });

    expect(here.location?.status).toBe("match");
    expect(away.location?.status).toBe("mismatch");
    expect(away.overall).toBe(here.overall);
  });

  it("treats a remote role as location-neutral", () => {
    const result = buildFitSummary({
      analysis: analysis(80),
      application: { ...application, workMode: "Remote", location: "Dunedin" },
      profile,
    });

    expect(result.location?.status).toBe("match");
  });

  it("surfaces language requirements next to the score", () => {
    const result = buildFitSummary({
      analysis: analysis(80),
      application: {
        ...application,
        jobDescription:
          "Fluent Mandarin is required. International applicants welcome.",
      },
      profile,
    });

    expect(result.languages[0].language).toBe("Mandarin");
  });
});
