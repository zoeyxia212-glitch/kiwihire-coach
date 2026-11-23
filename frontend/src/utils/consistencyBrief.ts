/**
 * Lists the claims on a resume that an interviewer is most likely to probe.
 *
 * The interviewer has read the submitted resume. The rule is simple: no claim
 * in the room that is not on the paper, and every claim on the paper must be
 * defensible in depth. This picks out the sentences to be ready to defend:
 *  - evidence for a skill the posting asks for, and
 *  - sentences that contain a number, because a figure invites "how did you
 *    measure that?".
 *
 * Idea adapted from the consistency brief in the /interview command of
 * MadsLorentzen/ai-job-search (MIT).
 */

import type { ResumeAnalysisItem } from "../types/resumeAnalysis";

export type ClaimReason = "requirement" | "number";

export type ClaimToDefend = {
  claim: string;
  reasons: ClaimReason[];
  skills: string[];
};

const NUMBER_CLAIM =
  /\d+(?:\.\d+)?\s?(?:%|x\b|k\b|m\b)|\$\s?\d|\b\d{2,}\s+(?:users?|customers?|clients?|servers?|devices?|tickets?|requests?|hours?|days?|projects?|people|engineers?|members?|incidents?)\b|\bby\s+\d+/i;

function sentences(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/^[\s\-•*]+/, "").trim())
    .filter((sentence) => sentence.length > 8);
}

function trim(claim: string): string {
  return claim.length > 180 ? `${claim.slice(0, 177)}...` : claim;
}

export function buildConsistencyBrief(
  matched: ResumeAnalysisItem[],
  resumeText: string,
  max = 8,
): ClaimToDefend[] {
  const byClaim = new Map<string, ClaimToDefend>();

  const add = (claim: string, reason: ClaimReason, skill?: string) => {
    const key = trim(claim);
    const existing = byClaim.get(key);
    if (existing) {
      if (!existing.reasons.includes(reason)) {
        existing.reasons.push(reason);
      }
      if (skill && !existing.skills.includes(skill)) {
        existing.skills.push(skill);
      }
      return;
    }
    byClaim.set(key, {
      claim: key,
      reasons: [reason],
      skills: skill ? [skill] : [],
    });
  };

  for (const item of matched) {
    if (item.evidence) {
      add(item.evidence.trim(), "requirement", item.skill);
    }
  }
  for (const sentence of sentences(resumeText)) {
    if (NUMBER_CLAIM.test(sentence)) {
      add(sentence, "number");
    }
  }

  return [...byClaim.values()]
    .sort((first, second) => second.reasons.length - first.reasons.length)
    .slice(0, max);
}
