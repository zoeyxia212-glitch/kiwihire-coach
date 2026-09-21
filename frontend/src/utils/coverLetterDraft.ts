import type { EvidenceItem } from "../types/evidenceItem";
import { countWords, findOverclaimPhrase, hasPlaceholderText } from "./localReview";

export type CoverLetterDraftInput = {
  company: string;
  roleTitle: string;
  hiringManagerName: string;
  candidateName?: string;
  motivation: string;
  evidenceItems: EvidenceItem[];
};

export type CoverLetterQualityCheck = {
  label: string;
  passed: boolean;
  guidance: string;
};

export function buildCoverLetterDraft({
  company,
  roleTitle,
  hiringManagerName,
  candidateName = "",
  motivation,
  evidenceItems,
}: CoverLetterDraftInput) {
  const greeting = hiringManagerName.trim()
    ? `Dear ${hiringManagerName.trim()},`
    : `Dear ${company.trim()} hiring team,`;
  const paragraphs = [
    greeting,
    `I am writing to apply for the ${roleTitle.trim()} position at ${company.trim()}.`,
  ];

  if (motivation.trim()) {
    paragraphs.push(motivation.trim());
  }

  evidenceItems.slice(0, 3).forEach((item) => {
    const evidence = [
      item.context.trim(),
      item.action.trim() && `I ${lowercaseFirst(item.action.trim())}`,
      item.result.trim() && `This led to ${lowercaseFirst(item.result.trim())}`,
    ].filter(Boolean).join(". ");

    if (evidence) {
      paragraphs.push(`${evidence.replace(/[. ]+$/, "")}.`);
    }
  });

  paragraphs.push(
    `I would welcome the opportunity to discuss how my experience could contribute to ${company.trim()}.`,
    `Kind regards,\n${candidateName.trim() || "[Your name]"}`,
  );

  return paragraphs.join("\n\n");
}

/**
 * Local, deterministic quality checklist for a cover letter draft. Built
 * on the same shared primitives (word counting, overclaim-phrase and
 * placeholder detection) that resumeBulletReviewer.ts's
 * reviewResumeBullet uses, rather than each file reimplementing its own
 * copy - see localReview.ts and docs/product-plan.md,
 * "AI Integration Principles".
 */
export function reviewCoverLetterDraft(
  draft: string,
  company: string,
  roleTitle: string,
): CoverLetterQualityCheck[] {
  const normalizedDraft = draft.toLowerCase();
  const wordCount = countWords(draft);
  const hasConcreteEvidence = /\b(built|created|designed|developed|delivered|implemented|improved|increased|reduced|led|tested|automated)\b/i
    .test(draft) || /\b\d+(?:\.\d+)?%?\b/.test(draft);
  const overclaim = findOverclaimPhrase(draft);

  return [
    {
      label: "Names the company",
      passed: normalizedDraft.includes(company.trim().toLowerCase()),
      guidance: `Mention ${company} so the letter is role-specific.`,
    },
    {
      label: "Names the role",
      passed: normalizedDraft.includes(roleTitle.trim().toLowerCase()),
      guidance: `Mention the ${roleTitle} position clearly.`,
    },
    {
      label: "Uses concrete evidence",
      passed: hasConcreteEvidence,
      guidance: "Describe something you built, improved, tested, or delivered.",
    },
    {
      label: "Has a practical length",
      passed: wordCount >= 150 && wordCount <= 450,
      guidance: `Aim for 150–450 words. Current length: ${wordCount}.`,
    },
    {
      label: "Removes placeholders",
      passed: !hasPlaceholderText(draft),
      guidance: "Replace placeholders such as [Your name] before sending.",
    },
    {
      label: "Avoids overclaiming",
      passed: !overclaim,
      guidance: overclaim
        ? `Contains "${overclaim}", which reads as an unverifiable claim. Describe what you actually did instead.`
        : "Avoid unverifiable claims like \"world-class\" or \"expert in\" - describe what you actually did.",
    },
  ];
}

function lowercaseFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
