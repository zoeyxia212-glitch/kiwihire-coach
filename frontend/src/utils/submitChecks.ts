/**
 * Pre-submit checks that combine the rule results for one application.
 *
 * Each check reports pass, warn or fail with a plain reason. A fail is a
 * blocker worth fixing before sending; a warn is worth a look. Nothing here
 * stops the person from submitting: they may know something the data does
 * not.
 */

import { checkEligibility } from "./eligibilityGate";
import {
  checkLanguages,
  failedLanguage,
  findLanguageRequirements,
} from "./languageRequirements";
import { closingUrgency } from "./applicationAttention";
import { findUnsupportedSkills } from "./groundingCheck";
import { sanitizeJobText } from "./jobTextSanitizer";

export type CheckStatus = "pass" | "warn" | "fail";

export type SubmitCheck = {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

export type SubmitCheckInput = {
  application: {
    status: string;
    closingDate: string | null;
    jobDescription: string;
    workRightsRequirement: string | null;
    sponsorshipAvailable: boolean | null;
    company: string;
    industry: string | null;
    coverLetterDraft: string | null;
  };
  profile: { workRights: string; spokenLanguages?: string } | null;
  groundingSources: string[];
  hasCvReview: boolean;
  today?: Date;
};

export function buildSubmitChecks(input: SubmitCheckInput): SubmitCheck[] {
  const { application, profile, groundingSources, hasCvReview } = input;
  const checks: SubmitCheck[] = [];

  const closing = closingUrgency(
    application.status,
    application.closingDate,
    input.today,
  );
  checks.push(
    closing.kind === "missed"
      ? { key: "deadline", label: "Closing date", status: "fail", detail: closing.label }
      : closing.kind === "soon"
        ? { key: "deadline", label: "Closing date", status: "warn", detail: closing.label }
        : {
            key: "deadline",
            label: "Closing date",
            status: "pass",
            detail: application.closingDate
              ? "The closing date has not passed."
              : "No closing date saved.",
          },
  );

  const gate = checkEligibility({
    jobDescription: application.jobDescription,
    workRightsRequirement: application.workRightsRequirement,
    sponsorshipAvailable: application.sponsorshipAvailable,
    candidateWorkRights: profile?.workRights ?? "",
    company: application.company,
    industry: application.industry,
  });
  checks.push({
    key: "eligibility",
    label: "Work rights",
    status:
      gate.verdict === "fail"
        ? "fail"
        : gate.verdict === "unverified" || gate.verdict === "unknown"
          ? "warn"
          : "pass",
    detail: gate.quote ? `${gate.headline} "${gate.quote}"` : gate.headline,
  });

  const languages = checkLanguages(
    findLanguageRequirements(application.jobDescription),
    profile?.spokenLanguages ?? "",
  );
  const blocked = failedLanguage(languages);
  checks.push(
    blocked
      ? {
          key: "language",
          label: "Language requirement",
          status: "fail",
          detail: `Asks for ${blocked.language} at fluent or native level and it is not on your profile.`,
        }
      : languages.some((item) => item.status === "unchecked")
        ? {
            key: "language",
            label: "Language requirement",
            status: "warn",
            detail:
              "The posting names a language but your profile lists none. Add your languages to check it.",
          }
        : {
            key: "language",
            label: "Language requirement",
            status: "pass",
            detail: languages.length
              ? "The languages named are on your profile or optional."
              : "No language requirement found.",
          },
  );

  const letter = application.coverLetterDraft?.trim() ?? "";
  if (letter) {
    const unsupported = findUnsupportedSkills(letter, groundingSources);
    checks.push(
      unsupported.length > 0
        ? {
            key: "claims",
            label: "Cover letter claims",
            status: "warn",
            detail: `No evidence for: ${unsupported.join(", ")}.`,
          }
        : {
            key: "claims",
            label: "Cover letter claims",
            status: "pass",
            detail: "Every tracked skill in the letter has evidence behind it.",
          },
    );
  } else {
    checks.push({
      key: "claims",
      label: "Cover letter claims",
      status: "warn",
      detail: "No cover letter saved to check.",
    });
  }

  const sanitised = sanitizeJobText(application.jobDescription);
  checks.push(
    sanitised.hasWarnings
      ? {
          key: "posting",
          label: "Job posting text",
          status: "warn",
          detail:
            "The saved posting contains hidden characters or instruction-like lines. Read it before relying on the analysis.",
        }
      : {
          key: "posting",
          label: "Job posting text",
          status: "pass",
          detail: "No hidden characters or instruction-like lines.",
        },
  );

  checks.push(
    hasCvReview
      ? { key: "cv", label: "CV review", status: "pass", detail: "A CV review is saved for this role." }
      : { key: "cv", label: "CV review", status: "warn", detail: "No CV review saved for this role yet." },
  );

  return checks;
}

export function submitBlockers(checks: SubmitCheck[]): SubmitCheck[] {
  return checks.filter((check) => check.status === "fail");
}
