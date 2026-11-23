/**
 * Finds technical skills that a piece of writing claims but that appear
 * nowhere in the person's own material.
 *
 * Every claim in a cover letter or resume suggestion must be supported by the
 * person's resume, Candidate Profile or Evidence Bank. A gap is stated
 * honestly and bridged with adjacent experience; it is never filled with a
 * skill the person cannot show. Only technical skills are checked, because
 * words like "communication" appear in almost any text.
 *
 * Rule adapted from the reviewer's grounding rule in
 * MadsLorentzen/ai-job-search (MIT).
 */

import { findSkillsMentioned } from "./resumeAnalysis";

export const TECHNICAL_SKILLS = new Set([
  "React",
  "TypeScript",
  "JavaScript",
  "Java",
  "Spring Boot",
  "REST APIs",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Git",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "CI/CD",
  "Linux",
]);

export function findUnsupportedSkills(
  text: string,
  supportingTexts: string[],
): string[] {
  const supported = new Set(findSkillsMentioned(supportingTexts.join("\n")));

  return findSkillsMentioned(text).filter(
    (skill) => TECHNICAL_SKILLS.has(skill) && !supported.has(skill),
  );
}
