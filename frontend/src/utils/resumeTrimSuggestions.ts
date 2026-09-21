/**
 * Local, deterministic resume-length trimming suggestions.
 *
 * Reuses the evidence the review already found relevant - the `evidence`
 * quotes on matched/transferable ReviewAnalysisItem entries - instead of
 * calling out to anything new. A resume line is flagged as a possible
 * trim when it is substantial (not a header or contact line) but shares
 * no keywords with any evidence the review credited, meaning it isn't
 * currently backing up a matched or transferable skill for this role.
 * This is a heuristic, not a verdict: it's meant to help a candidate
 * decide what to cut first when a resume runs long, never to silently
 * remove anything. See localReview.ts and docs/product-plan.md,
 * "AI Integration Principles".
 */

import { countWords, extractKeywords } from "./localReview";
import type { ResumeAnalysisItem } from "../types/resumeAnalysis";

export type TrimSuggestion = {
  line: string;
  reason: string;
};

const MIN_WORDS_FOR_CANDIDATE = 6;
const MAX_LINES_TO_SCAN = 200;
const MAX_SUGGESTIONS = 8;

export function suggestResumeTrims(
  resumeText: string,
  relevantItems: ResumeAnalysisItem[],
): TrimSuggestion[] {
  const evidenceKeywords = new Set<string>();
  relevantItems.forEach((item) => {
    if (item.evidence?.trim()) {
      extractKeywords(item.evidence).forEach((word) =>
        evidenceKeywords.add(word),
      );
    }
  });

  // Nothing to compare against yet (e.g. no matches found) - don't guess.
  if (evidenceKeywords.size === 0) {
    return [];
  }

  const lines = resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_LINES_TO_SCAN);

  const suggestions: TrimSuggestion[] = [];

  for (const line of lines) {
    if (suggestions.length >= MAX_SUGGESTIONS) {
      break;
    }

    if (countWords(line) < MIN_WORDS_FOR_CANDIDATE || looksLikeHeaderOrContact(line)) {
      continue;
    }

    const lineKeywords = extractKeywords(line);
    const backsUpAMatch = [...lineKeywords].some((word) =>
      evidenceKeywords.has(word),
    );

    if (!backsUpAMatch) {
      suggestions.push({
        line,
        reason:
          "Doesn't share wording with any skill this review matched or credited as transferable - a candidate to shorten or cut if space is tight.",
      });
    }
  }

  return suggestions;
}

function looksLikeHeaderOrContact(line: string): boolean {
  if (/@/.test(line) || /\d{3}[\s-]?\d{3}[\s-]?\d{4}/.test(line)) {
    return true;
  }

  // Short title-case/all-caps lines with no sentence punctuation read as
  // section headers ("Work Experience", "EDUCATION") rather than content.
  if (countWords(line) <= 4 && /^[A-Z][A-Za-z\s&/-]*$/.test(line) && !/[.,]/.test(line)) {
    return true;
  }

  return false;
}
