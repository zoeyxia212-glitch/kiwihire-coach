/**
 * Traces each skill claim in a cover letter to the evidence behind it.
 *
 * Every sentence that names a technical skill is listed with the sources
 * that mention the same skill (profile, submitted resume, a named evidence
 * item). A skill with no source is marked unsupported. Sentences that name
 * no tracked skill are not listed: this checks claims it can verify, and
 * does not pretend to judge the rest of the letter.
 *
 * Extends the evidence grounding rule borrowed from MadsLorentzen/ai-job-search
 * (MIT): claims need support in what the person has really written.
 */

import { findSkillsMentioned } from "./resumeAnalysis";
import { TECHNICAL_SKILLS } from "./groundingCheck";

export type EvidenceSource = {
  label: string;
  text: string;
};

export type TracedSkill = {
  skill: string;
  sources: string[];
};

export type TracedClaim = {
  sentence: string;
  skills: TracedSkill[];
  supported: boolean;
};

function splitSentences(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function traceClaims(
  letter: string,
  sources: EvidenceSource[],
): TracedClaim[] {
  const sourceSkills = sources.map((source) => ({
    label: source.label,
    skills: new Set(findSkillsMentioned(source.text)),
  }));
  const claims: TracedClaim[] = [];

  for (const sentence of splitSentences(letter)) {
    const mentioned = findSkillsMentioned(sentence).filter((skill) =>
      TECHNICAL_SKILLS.has(skill),
    );
    if (mentioned.length === 0) {
      continue;
    }

    const skills = mentioned.map((skill) => ({
      skill,
      sources: sourceSkills
        .filter((source) => source.skills.has(skill))
        .map((source) => source.label),
    }));

    claims.push({
      sentence,
      skills,
      supported: skills.every((item) => item.sources.length > 0),
    });
  }

  return claims;
}
