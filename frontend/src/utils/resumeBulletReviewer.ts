/**
 * Deterministic, local "reviewer" pass for a generated resume bullet.
 *
 * This intentionally runs as a second, separate function from
 * buildResumeBullet (the "drafter") rather than folding review logic into
 * generation - see docs/product-plan.md, "AI Integration Principles":
 * draft and review should be two independent passes, and deterministic
 * checks should stay deterministic rather than depend on any paid AI
 * service. Everything here is plain string/regex heuristics - no network
 * calls, no API keys, no cost. Shared primitives (word counting, keyword
 * overlap, overclaim-phrase detection) live in localReview.ts so this and
 * coverLetterDraft.ts's reviewCoverLetterDraft don't each reimplement them.
 */

import {
  countWords,
  extractKeywords,
  findOverclaimPhrase,
  isLikelyPassiveVoice,
  longestSharedWordRun,
} from "./localReview";

export type BulletReviewFinding = {
  id: string;
  message: string;
};

export function reviewResumeBullet(
  bullet: string,
  jobDescription = "",
): BulletReviewFinding[] {
  const findings: BulletReviewFinding[] = [];
  const trimmed = bullet.trim();

  if (!trimmed) {
    return findings;
  }

  const wordCount = countWords(trimmed);

  if (!/\d/.test(trimmed)) {
    findings.push({
      id: "no-metric",
      message:
        "No number or measurable outcome detected. If you have a real metric, consider adding it - only include it if it's true.",
    });
  }

  const overclaim = findOverclaimPhrase(trimmed);
  if (overclaim) {
    findings.push({
      id: "overclaim",
      message: `Contains "${overclaim}", which reads as an unverifiable claim. Consider describing what you actually did instead.`,
    });
  }

  if (isLikelyPassiveVoice(trimmed)) {
    findings.push({
      id: "passive-voice",
      message:
        "This may be in passive voice. Leading with an action verb you performed (e.g., \"Led\", \"Built\", \"Reduced\") usually reads stronger.",
    });
  }

  if (wordCount < 6) {
    findings.push({
      id: "too-short",
      message:
        "This is quite short for a resume bullet - it may not show enough of what you actually did.",
    });
  } else if (wordCount > 40) {
    findings.push({
      id: "too-long",
      message:
        "This is long for a single bullet. Consider trimming to the part that best shows impact.",
    });
  }

  if (jobDescription.trim()) {
    const jdWords = extractKeywords(jobDescription);
    const bulletWords = extractKeywords(trimmed);
    const overlap = [...bulletWords].filter((word) => jdWords.has(word));

    if (overlap.length === 0) {
      findings.push({
        id: "no-jd-overlap",
        message:
          "This bullet doesn't share any terms with the job description - double check it's relevant to this role.",
      });
    }

    const copiedRun = longestSharedWordRun(trimmed, jobDescription, 6);
    if (copiedRun >= 6) {
      findings.push({
        id: "jd-copy",
        message:
          "Part of this looks copied directly from the job description. Rewrite it in your own words based on what you actually did.",
      });
    }
  }

  return findings;
}
