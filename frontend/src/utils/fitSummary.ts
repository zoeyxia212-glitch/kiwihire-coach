/**
 * Combines the skills analysis with role, level and eligibility checks into
 * one explainable fit summary.
 *
 * Everything here is deterministic and runs in the browser: no paid service
 * and nothing sent anywhere. The gates run first and are not scored. A role
 * that fails the eligibility gate is not scored at all.
 *
 * The overall score is a weighted average of the dimensions that could be
 * worked out. A dimension with no data is left out and the remaining weights
 * are rebalanced; it is never counted as zero. Without a skills score there
 * is no overall score.
 *
 * Bands and advice follow the fit thresholds used by
 * MadsLorentzen/ai-job-search (MIT); the dimensions are KiwiHire's own,
 * because KiwiHire can only measure what it stores.
 */

import type { Application } from "../types/application";
import type { CandidateProfile } from "../types/candidateProfile";
import type { ResumeAnalysis } from "../types/resumeAnalysis";
import { checkEligibility, type EligibilityResult } from "./eligibilityGate";
import {
  checkLanguages,
  failedLanguage,
  findLanguageRequirements,
  type CheckedLanguage,
} from "./languageRequirements";
import { extractKeywords } from "./localReview";

export type FitApplication = Pick<
  Application,
  | "company"
  | "roleTitle"
  | "jobDescription"
  | "location"
  | "workMode"
  | "careerLevel"
  | "graduateFriendly"
  | "sponsorshipAvailable"
  | "workRightsRequirement"
  | "industry"
>;

export type FitProfile = Pick<
  CandidateProfile,
  "targetRoles" | "workRights" | "preferredLocations" | "careerStage"
> &
  Partial<Pick<CandidateProfile, "spokenLanguages">>;

export type FitBand = "strong" | "good" | "moderate" | "weak" | "poor";

export type FitDimension = {
  key: "skills" | "role" | "level";
  label: string;
  weight: number;
  score: number | null;
  note: string;
};

export type LocationNote = {
  status: "match" | "mismatch";
  text: string;
};

export type FitSummary = {
  gate: EligibilityResult;
  languages: CheckedLanguage[];
  scored: boolean;
  overall: number | null;
  band: FitBand | null;
  advice: string;
  dimensions: FitDimension[];
  location: LocationNote | null;
};

export const FIT_WEIGHTS = { skills: 50, role: 30, level: 20 } as const;

export function bandForScore(score: number): FitBand {
  if (score >= 75) return "strong";
  if (score >= 60) return "good";
  if (score >= 45) return "moderate";
  if (score >= 30) return "weak";
  return "poor";
}

export const BAND_LABELS: Record<FitBand, string> = {
  strong: "Strong fit",
  good: "Good fit",
  moderate: "Moderate fit",
  weak: "Weak fit",
  poor: "Poor fit",
};

const BAND_ADVICE: Record<FitBand, string> = {
  strong: "Worth tailoring your resume and cover letter closely.",
  good: "Apply, and speak to the gaps below in your cover letter.",
  moderate:
    "Decide deliberately. A few gaps may need real evidence before you apply.",
  weak: "Only worth applying if you have a strategic reason.",
  poor: "Your time is probably better spent on other roles.",
};

const LEVEL_WORDS = new Set([
  "junior",
  "senior",
  "graduate",
  "intern",
  "internship",
  "lead",
  "principal",
  "intermediate",
  "mid",
  "associate",
  "entry",
  "level",
]);

function roleKeywords(text: string): Set<string> {
  const normalised = text
    .toLowerCase()
    .replace(/\b(developer|programmer|swe)s?\b/g, "engineer")
    .replace(/\bfront[- ]?end\b/g, "frontend")
    .replace(/\bback[- ]?end\b/g, "backend")
    .replace(/\bfull[- ]?stack\b/g, "fullstack");

  return new Set(
    [...extractKeywords(normalised)].filter((word) => !LEVEL_WORDS.has(word)),
  );
}

function roleAlignment(
  roleTitle: string,
  targetRoles: string,
): { score: number | null; note: string } {
  const phrases = targetRoles
    .split(/[,;\n|]+/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  const titleWords = roleKeywords(roleTitle);

  if (phrases.length === 0 || titleWords.size === 0) {
    return {
      score: null,
      note: "Add target roles to your Candidate Profile to see this.",
    };
  }

  let best = { score: 0, phrase: phrases[0] };
  for (const phrase of phrases) {
    const words = roleKeywords(phrase);
    if (words.size === 0) {
      continue;
    }
    const shared = [...words].filter((word) => titleWords.has(word)).length;
    const score = Math.round((shared / words.size) * 100);
    if (score > best.score) {
      best = { score, phrase };
    }
  }

  return {
    score: best.score,
    note:
      best.score > 0
        ? `Closest to your target role "${best.phrase}".`
        : "The title shares no keywords with your target roles.",
  };
}

function levelRank(text: string): number | null {
  const lower = text.toLowerCase();
  if (/\b(intern|internship|student)\b/.test(lower)) return 0;
  if (/\b(graduate|grad|entry|new grad)\b/.test(lower)) return 0;
  if (/\bjunior\b/.test(lower)) return 1;
  if (/\b(mid|intermediate|experienced)\b/.test(lower)) return 2;
  if (/\bsenior\b/.test(lower)) return 3;
  if (/\b(lead|principal|staff|manager|head)\b/.test(lower)) return 4;
  return null;
}

function levelFit(
  application: FitApplication,
  careerStage: string,
): { score: number | null; note: string } {
  const candidate = levelRank(careerStage);
  const job =
    levelRank(application.careerLevel ?? "") ??
    levelRank(application.roleTitle);

  if (candidate === null || job === null) {
    return {
      score: null,
      note: "Set your career stage and the role's career level to see this.",
    };
  }
  if (application.graduateFriendly === true && candidate <= 1) {
    return { score: 100, note: "The role is marked graduate friendly." };
  }

  const gap = job - candidate;
  if (gap <= 0) {
    return { score: 100, note: "The level matches or is below your stage." };
  }
  if (gap === 1) {
    return { score: 60, note: "One level above your current stage." };
  }
  if (gap === 2) {
    return { score: 25, note: "Two levels above your current stage." };
  }
  return { score: 0, note: "Well above your current stage." };
}

function locationNote(
  application: FitApplication,
  preferredLocations: string,
): LocationNote | null {
  const preferences = preferredLocations
    .toLowerCase()
    .split(/[,;\n/]+/)
    .map((place) => place.trim())
    .filter((place) => place.length > 2);
  const location = (application.location ?? "").toLowerCase();

  if ((application.workMode ?? "").toLowerCase().includes("remote")) {
    return { status: "match", text: "Remote role, so location is not a constraint." };
  }
  if (preferences.length === 0 || !location) {
    return null;
  }
  if (preferences.some((place) => location.includes(place))) {
    return { status: "match", text: "The location matches your preferences." };
  }
  return {
    status: "mismatch",
    text: "The location is outside your preferred locations. Check commute or relocation.",
  };
}

export function buildFitSummary(input: {
  analysis: ResumeAnalysis;
  application: FitApplication;
  profile: FitProfile | null;
}): FitSummary {
  const { analysis, application, profile } = input;

  const gate = checkEligibility({
    jobDescription: application.jobDescription,
    workRightsRequirement: application.workRightsRequirement,
    sponsorshipAvailable: application.sponsorshipAvailable,
    candidateWorkRights: profile?.workRights ?? "",
    company: application.company,
    industry: application.industry,
  });
  const languages = checkLanguages(
    findLanguageRequirements(application.jobDescription),
    profile?.spokenLanguages ?? "",
  );
  const blockedLanguage = failedLanguage(languages);
  const location = profile
    ? locationNote(application, profile.preferredLocations)
    : null;

  const role = roleAlignment(application.roleTitle, profile?.targetRoles ?? "");
  const level = levelFit(application, profile?.careerStage ?? "");
  const dimensions: FitDimension[] = [
    {
      key: "skills",
      label: "Skills match",
      weight: FIT_WEIGHTS.skills,
      score: analysis.score,
      note:
        analysis.score === null
          ? "No supported skill terms were found in the job description."
          : "Matched skills count fully and transferable ones count half.",
    },
    {
      key: "role",
      label: "Role alignment",
      weight: FIT_WEIGHTS.role,
      score: role.score,
      note: role.note,
    },
    {
      key: "level",
      label: "Level fit",
      weight: FIT_WEIGHTS.level,
      score: level.score,
      note: level.note,
    },
  ];

  if (gate.verdict === "fail") {
    return {
      gate,
      languages,
      scored: false,
      overall: null,
      band: null,
      advice:
        "Not scored. Check the wording below; you may know something about your own status that your profile does not record.",
      dimensions,
      location,
    };
  }

  if (blockedLanguage) {
    return {
      gate,
      languages,
      scored: false,
      overall: null,
      band: null,
      advice: `Not scored. The posting asks for ${blockedLanguage.language} at fluent or native level and it is not in the languages on your profile. If you do speak it, add it to your profile.`,
      dimensions,
      location,
    };
  }

  if (analysis.score === null) {
    return {
      gate,
      languages,
      scored: false,
      overall: null,
      band: null,
      advice:
        "Not scored: there is no skills result to build on. Add a more detailed job description.",
      dimensions,
      location,
    };
  }

  const available = dimensions.filter(
    (dimension): dimension is FitDimension & { score: number } =>
      dimension.score !== null,
  );
  const totalWeight = available.reduce(
    (total, dimension) => total + dimension.weight,
    0,
  );
  const overall = Math.round(
    available.reduce(
      (total, dimension) => total + dimension.score * dimension.weight,
      0,
    ) / totalWeight,
  );
  const band = bandForScore(overall);

  return {
    gate,
    languages,
    scored: true,
    overall,
    band,
    advice: BAND_ADVICE[band],
    dimensions,
    location,
  };
}
