/**
 * Finds language requirements in a job posting so the user can check them
 * against their own level.
 *
 * KiwiHire does not store the languages a candidate speaks, so this cannot
 * pass or fail a role. It surfaces the requirement with its quoted wording
 * and lets the person decide: bars like "fluent" vary a lot between
 * employers, and the human is the tiebreaker.
 */

export type LanguageRequirement = {
  language: string;
  /** True when the posting asks for fluency, native level or bilingualism. */
  demanding: boolean;
  /** True when the posting calls it a bonus rather than a requirement. */
  optional: boolean;
  quote: string;
};

const LANGUAGES = [
  "Mandarin",
  "Cantonese",
  "Chinese",
  "Japanese",
  "Korean",
  "Hindi",
  "Punjabi",
  "Samoan",
  "Tongan",
  "Te Reo Māori",
  "Te Reo Maori",
  "Māori",
  "Maori",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Malay",
  "English",
];

const REQUIREMENT_WORDS =
  /\b(fluent|fluency|proficien\w*|native|bilingual|multilingual|speak\w*|conversational|written and (spoken|verbal)|verbal and written|language skills?)\b/i;
const DEMANDING = /\b(fluent|fluency|native|bilingual|multilingual)\b/i;
const OPTIONAL =
  /\b(preferred|desirable|an advantage|advantageous|bonus|nice to have|an asset|beneficial)\b/i;

function normalise(language: string): string {
  if (/^te reo/i.test(language) || /^m[āa]ori$/i.test(language)) {
    return "Te Reo Māori";
  }
  return language;
}

export function findLanguageRequirements(
  jobDescription: string,
): LanguageRequirement[] {
  const sentences = jobDescription
    .split(/\r?\n|(?<=[.!?;])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const found = new Map<string, LanguageRequirement>();

  for (const sentence of sentences) {
    if (!REQUIREMENT_WORDS.test(sentence)) {
      continue;
    }

    for (const language of LANGUAGES) {
      const pattern = new RegExp(
        `(^|[^\\p{L}])${language}([^\\p{L}]|$)`,
        "iu",
      );
      if (!pattern.test(sentence)) {
        continue;
      }

      const name = normalise(language);
      // "English" appears in almost every posting; only report a demanding bar.
      if (name === "English" && !DEMANDING.test(sentence)) {
        continue;
      }
      if (found.has(name)) {
        continue;
      }

      found.set(name, {
        language: name,
        demanding: DEMANDING.test(sentence),
        optional: OPTIONAL.test(sentence),
        quote:
          sentence.length > 200 ? `${sentence.slice(0, 197)}...` : sentence,
      });
    }
  }

  return [...found.values()];
}
