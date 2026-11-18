/**
 * Finds language requirements in a job posting so the user can check them
 * against their own level.
 *
 * Each requirement is checked against the languages the person lists on
 * their profile. A language they have not listed is only a gate when the
 * posting asks for fluency or native level and does not call it a bonus.
 * Everything else is shown with its quoted wording and left to the person,
 * because bars like "fluent" vary a lot between employers.
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

export type LanguageStatus = "listed" | "not-listed" | "unchecked";

export type CheckedLanguage = LanguageRequirement & {
  status: LanguageStatus;
};

function listedLanguages(spoken: string): string[] {
  return spoken
    .split(/[,;/&\n]|\band\b/i)
    .map((entry) => normalise(entry.trim()).toLowerCase())
    .filter(Boolean);
}

function isListed(language: string, listed: string[]): boolean {
  const wanted = language.toLowerCase();
  if (listed.includes(wanted)) {
    return true;
  }
  // "Chinese" in a posting is met by Mandarin or Cantonese, and the reverse
  // when the person simply lists "Chinese".
  if (wanted === "chinese") {
    return listed.some((entry) => entry === "mandarin" || entry === "cantonese");
  }
  if (wanted === "mandarin" || wanted === "cantonese") {
    return listed.includes("chinese");
  }
  return false;
}

/** Marks each requirement as listed, not listed, or unchecked (no languages saved). */
export function checkLanguages(
  requirements: LanguageRequirement[],
  spokenLanguages: string,
): CheckedLanguage[] {
  const listed = listedLanguages(spokenLanguages ?? "");

  return requirements.map((requirement) => ({
    ...requirement,
    status:
      listed.length === 0
        ? "unchecked"
        : isListed(requirement.language, listed)
          ? "listed"
          : "not-listed",
  }));
}

/** The requirement that blocks the role, if any. */
export function failedLanguage(
  checked: CheckedLanguage[],
): CheckedLanguage | undefined {
  return checked.find(
    (item) =>
      item.status === "not-listed" && item.demanding && !item.optional,
  );
}
