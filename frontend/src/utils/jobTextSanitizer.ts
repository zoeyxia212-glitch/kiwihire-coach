/**
 * Cleans pasted job-posting text and reports anything suspicious.
 *
 * A job description is third-party text. It can carry invisible characters
 * (zero-width, bidi controls, Unicode "tag" characters that render as nothing)
 * and lines written to instruct an AI tool rather than inform a reader.
 * KiwiHire's own checks are deterministic, but the cleaned text may later be
 * sent to an AI service, so the clean-up happens before storage.
 *
 * The rule is: remove what cannot be seen, report what looks targeted, and
 * never block the user. Instruction-shaped lines are quoted, not deleted,
 * because a legitimate posting can say "SSH" or "act as the main contact".
 *
 * Idea adapted from the integrity gate in MadsLorentzen/ai-job-search (MIT).
 */

export type SanitizedJobText = {
  text: string;
  invisibleCharsRemoved: number;
  tagCharsRemoved: number;
  /** Text that was spelled in invisible tag characters, decoded. */
  hiddenText: string | null;
  tamperingDetected: boolean;
  instructionLines: string[];
  mixedScriptWords: string[];
  hasWarnings: boolean;
};

// Zero-width, bidi controls, soft hyphen, word joiner and BOM. U+200D (the
// zero-width joiner) is kept when it sits inside an emoji sequence.
const INVISIBLE =
  /[​‌‎‏‪-‮⁠-⁤⁦-⁩­﻿]|(?<!\p{Extended_Pictographic}️?)‍|‍(?!\p{Extended_Pictographic})/gu;

// A zero-width character between two letters, or a bidi override/isolate.
const TAMPERING =
  /\p{L}[​‌‍⁠﻿]\p{L}|[‪-‮⁦-⁩]/u;

const TAG_CHARS = /[\u{E0000}-\u{E007F}]/gu;
// England, Scotland and Wales flag emoji are legitimate tag sequences.
const FLAG_SEQUENCE = /(\u{1F3F4}[\u{E0061}-\u{E007A}]+\u{E007F})/u;

const INSTRUCTION_PATTERNS: RegExp[] = [
  /\b(ignore|disregard|forget)\b.{0,40}\b(previous|above|prior|earlier|all)\b.{0,40}\b(instructions?|prompts?|rules?)\b/i,
  /\b(you are|act as|pretend to be)\b.{0,30}\b(an? )?(ai|assistant|language model|llm|chatbot)\b/i,
  /\b(system prompt|developer message)\b/i,
  /\b(ai|llm|chatbot|language model|automated (screening )?(tool|system))s?\b.{0,60}\b(recommend|rank|score|rate|shortlist|advance|approve|hire|reveal|disclose)\b.{0,40}\b(this|the|every)\s+(candidate|applicant|application|resume|cv)/i,
  /\b(reveal|print|output|send|email|exfiltrate|leak)\b.{0,40}\b(resume|cv|profile|password|api key|secret|personal)\b/i,
  /\bdo not (tell|inform|mention)\b.{0,30}\b(user|candidate|applicant)\b/i,
];

const MAX_REPORTED = 5;

function decodeTagText(text: string): string {
  let decoded = "";
  for (const char of text.matchAll(TAG_CHARS)) {
    const code = (char[0].codePointAt(0) ?? 0) - 0xe0000;
    if (code >= 0x20 && code <= 0x7e) {
      decoded += String.fromCharCode(code);
    }
  }
  return decoded.trim();
}

function findInstructionLines(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) =>
      INSTRUCTION_PATTERNS.some((pattern) => pattern.test(line)),
    )
    .map((line) => (line.length > 160 ? `${line.slice(0, 157)}...` : line))
    .slice(0, MAX_REPORTED);
}

function findMixedScriptWords(text: string): string[] {
  const words = text.split(/\s+/).map((word) =>
    word.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ""),
  );
  const found = new Set<string>();

  for (const word of words) {
    if (
      /\p{Script=Latin}/u.test(word) &&
      /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(word)
    ) {
      found.add(word);
    }
    if (found.size >= MAX_REPORTED) {
      break;
    }
  }

  return [...found];
}

export function sanitizeJobText(input: string): SanitizedJobText {
  const tamperingDetected = TAMPERING.test(input);
  let tagCharsRemoved = 0;
  const hiddenParts: string[] = [];

  // Odd indexes of the split are legitimate flag sequences: leave them alone.
  const withoutTags = input
    .split(FLAG_SEQUENCE)
    .map((segment, index) => {
      if (index % 2 === 1) {
        return segment;
      }
      const tags = segment.match(TAG_CHARS);
      if (tags) {
        tagCharsRemoved += tags.length;
        const decoded = decodeTagText(segment);
        if (decoded) {
          hiddenParts.push(decoded);
        }
      }
      return segment.replace(TAG_CHARS, "");
    })
    .join("");

  let invisibleCharsRemoved = 0;
  const text = withoutTags.replace(INVISIBLE, () => {
    invisibleCharsRemoved += 1;
    return "";
  });

  const hiddenText = hiddenParts.length ? hiddenParts.join(" ") : null;
  const instructionLines = findInstructionLines(
    hiddenText ? `${text}\n${hiddenText}` : text,
  );
  const mixedScriptWords = findMixedScriptWords(text);

  return {
    text,
    invisibleCharsRemoved,
    tagCharsRemoved,
    hiddenText,
    tamperingDetected,
    instructionLines,
    mixedScriptWords,
    // Plain invisible characters are common (soft hyphens, BOMs): context only.
    hasWarnings:
      tagCharsRemoved > 0 ||
      tamperingDetected ||
      instructionLines.length > 0 ||
      mixedScriptWords.length > 0,
  };
}

/** One short sentence for the UI, or null when nothing needs attention. */
export function describeSanitizerWarnings(
  result: SanitizedJobText,
): string | null {
  if (!result.hasWarnings) {
    return null;
  }

  const parts: string[] = [];
  if (result.tagCharsRemoved > 0 || result.tamperingDetected) {
    parts.push("hidden characters were removed from the text");
  }
  if (result.instructionLines.length > 0) {
    parts.push("some lines read like instructions to an AI tool");
  }
  if (result.mixedScriptWords.length > 0) {
    parts.push("some words mix look-alike letters from other alphabets");
  }

  return `This job description looks unusual: ${parts.join("; ")}. Review it before relying on it.`;
}
