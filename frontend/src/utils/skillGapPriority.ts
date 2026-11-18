/**
 * Ranks skill gaps across the roles a person has reviewed.
 *
 * A gap matters more when it stands between you and a role you are already
 * close to matching, so each role contributes its fit score (0 to 1) as the
 * weight of its gaps. A gap that blocks three near-fit roles outranks one
 * that blocks a single poor-fit role.
 *
 * Rules:
 *  - Only the latest review for each application counts, so reviewing one
 *    role twice does not inflate a gap.
 *  - A review with no score contributes nothing. It is counted and reported,
 *    never treated as a score of zero.
 *
 * Idea adapted from the weighted skill-gap heatmap in
 * MadsLorentzen/ai-job-search (MIT). That tool weights by the opposite
 * direction (lower fit, more weight); KiwiHire weights toward roles the person
 * is close to winning, which better suits choosing what to learn next.
 */

import type { ResumeAnalysisItem } from "../types/resumeAnalysis";

export type GapReview = {
  applicationId: number;
  score: number | null;
  missing: ResumeAnalysisItem[];
  company: string;
  roleTitle: string;
  createdAt: string;
};

export type WeightedSkillGap = {
  skill: string;
  weight: number;
  roles: number;
  exampleRoles: string[];
};

export type SkillGapPriority = {
  gaps: WeightedSkillGap[];
  skippedUnscored: number;
};

export function normaliseSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function weightSkillGaps(reviews: GapReview[]): SkillGapPriority {
  const latest = new Map<number, GapReview>();
  for (const review of reviews) {
    const current = latest.get(review.applicationId);
    if (
      !current ||
      new Date(review.createdAt).getTime() >
        new Date(current.createdAt).getTime()
    ) {
      latest.set(review.applicationId, review);
    }
  }

  const gaps = new Map<string, WeightedSkillGap>();
  let skippedUnscored = 0;

  for (const review of latest.values()) {
    if (review.score === null) {
      skippedUnscored += 1;
      continue;
    }

    const weight = Math.min(Math.max(review.score, 0), 100) / 100;
    const role = `${review.company} · ${review.roleTitle}`;
    const seen = new Set<string>();

    for (const item of review.missing) {
      const key = normaliseSkill(item.skill);
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);

      const gap = gaps.get(key) ?? {
        skill: item.skill.trim(),
        weight: 0,
        roles: 0,
        exampleRoles: [],
      };
      gap.weight += weight;
      gap.roles += 1;
      if (gap.exampleRoles.length < 3) {
        gap.exampleRoles.push(role);
      }
      gaps.set(key, gap);
    }
  }

  return {
    gaps: [...gaps.values()].sort(
      (first, second) =>
        second.weight - first.weight ||
        second.roles - first.roles ||
        first.skill.localeCompare(second.skill),
    ),
    skippedUnscored,
  };
}

/** Orders items that have a skill by their weighted priority, unknown last. */
export function orderBySkillPriority<T extends { skill: string }>(
  items: T[],
  gaps: WeightedSkillGap[],
): T[] {
  const rank = new Map(
    gaps.map((gap, index) => [normaliseSkill(gap.skill), index]),
  );

  return [...items].sort(
    (first, second) =>
      (rank.get(normaliseSkill(first.skill)) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(normaliseSkill(second.skill)) ?? Number.MAX_SAFE_INTEGER),
  );
}
