/**
 * Gap challenge questions.
 *
 * An interviewer who has read the posting and the resume will probe the
 * distance between them. Each gap from the resume review becomes one
 * question with an honest answer frame. Gaps already covered by an existing
 * question are skipped, so a topic is asked once.
 *
 * Idea from XiaqiuOO/interview-ready-skill (no licence file: idea only).
 */

import type { InterviewType } from "./interviewFocus";

export type GapChallenge = {
  skill: string;
  question: string;
  answerFrame: string[];
};

type SkillItem = { skill: string };

const LIMITS: Record<InterviewType, number> = {
  business: 3,
  hr: 2,
};

function normalise(value: string): string {
  return value.toLowerCase().trim();
}

function alreadyAsked(
  skill: string,
  questions: { relatedSkill: string }[],
): boolean {
  const target = normalise(skill);
  return questions.some((question) =>
    normalise(question.relatedSkill)
      .split(/[\/,&]|\band\b/)
      .map((term) => term.trim())
      .filter((term) => term && term !== "general")
      .some((term) => term === target || target.includes(term)),
  );
}

export function buildGapChallenges(
  missing: SkillItem[],
  transferable: SkillItem[],
  questions: { relatedSkill: string }[],
  type: InterviewType,
): GapChallenge[] {
  const closest = transferable[0]?.skill;
  const seen = new Set<string>();
  const challenges: GapChallenge[] = [];

  for (const item of missing) {
    const key = normalise(item.skill);
    if (!key || seen.has(key) || alreadyAsked(item.skill, questions)) {
      continue;
    }
    seen.add(key);

    challenges.push({
      skill: item.skill,
      question: `Your resume does not show ${item.skill}, and the role asks for it. How do you see that gap?`,
      answerFrame: [
        `Say plainly that you have not used ${item.skill} in a job.`,
        closest
          ? `Name the closest thing you have done (for example ${closest}) and what carries over.`
          : "Name the closest thing you have done and what carries over.",
        `Give a concrete step you are taking or would take in the first weeks to learn ${item.skill}.`,
      ],
    });

    if (challenges.length >= LIMITS[type]) {
      break;
    }
  }

  return challenges;
}
