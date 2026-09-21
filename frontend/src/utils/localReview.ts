/**
 * Shared, deterministic ("no paid AI") text-review primitives.
 *
 * frontend/src/utils/resumeBulletReviewer.ts and
 * frontend/src/utils/coverLetterDraft.ts each run a local review pass over
 * user-facing text (a resume bullet, a cover letter draft). They used to
 * duplicate the same word-counting, keyword-overlap, and overclaim-phrase
 * logic independently; this module is the shared implementation both now
 * build their checks from, and frontend/src/utils/resumeTrimSuggestions.ts
 * reuses the keyword helpers too. See docs/product-plan.md,
 * "AI Integration Principles" - deterministic checks stay deterministic
 * and independent of any paid service.
 */

export const OVERCLAIM_PHRASES = [
  "world-class",
  "world class",
  "best in class",
  "expert in",
  "expert at",
  "guru",
  "ninja",
  "rockstar",
  "unparalleled",
  "unmatched",
  "100%",
  "always",
  "never fail",
];

const DEFAULT_STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with",
  "at", "by", "is", "are", "was", "were", "be", "as", "that", "this",
  "will", "you", "your", "our", "we", "role", "team", "work", "using",
]);

/** Word count of trimmed text (0 for empty/whitespace-only input). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
}

/** Returns the first overclaiming phrase found in text, or null. */
export function findOverclaimPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  return OVERCLAIM_PHRASES.find((phrase) => lower.includes(phrase)) ?? null;
}

/** Cheap heuristic for passive voice: "was/were/been/being" + a past-tense verb. */
export function isLikelyPassiveVoice(text: string): boolean {
  return /\b(was|were|been|being)\b\s+\w+ed\b/.test(text.toLowerCase());
}

/** Lowercased, stopword-filtered keyword set for a piece of text. */
export function extractKeywords(
  text: string,
  stopwords: Set<string> = DEFAULT_STOPWORDS,
): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .filter((word) => word.length > 2 && !stopwords.has(word)),
  );
}

/** Keywords that appear in both a and b. */
export function sharedKeywords(
  a: string,
  b: string,
  stopwords: Set<string> = DEFAULT_STOPWORDS,
): string[] {
  const bWords = extractKeywords(b, stopwords);
  return [...extractKeywords(a, stopwords)].filter((word) => bWords.has(word));
}

/** Longest run of consecutive words shared between two texts (word count, not characters). */
export function longestSharedWordRun(a: string, b: string, minRun = 6): number {
  const wordsA = a.toLowerCase().split(/\s+/).filter(Boolean);
  const bTokens = b.toLowerCase().split(/\s+/).filter(Boolean);
  const runsB = new Set<string>();

  for (let size = minRun; size <= bTokens.length; size++) {
    for (let i = 0; i + size <= bTokens.length; i++) {
      runsB.add(bTokens.slice(i, i + size).join(" "));
    }
  }

  let longest = 0;
  for (let size = wordsA.length; size >= minRun; size--) {
    for (let i = 0; i + size <= wordsA.length; i++) {
      if (runsB.has(wordsA.slice(i, i + size).join(" "))) {
        longest = Math.max(longest, size);
      }
    }
  }

  return longest;
}

/** Detects unfilled template placeholders like [Your name] or {{company}}. */
export function hasPlaceholderText(text: string): boolean {
  return /\[[^\]]+\]|\{\{[^}]+\}\}|\b(?:todo|insert here|your name)\b/i.test(text);
}
