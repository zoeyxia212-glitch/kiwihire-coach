/**
 * Work-rights eligibility check for a job posting.
 *
 * This is a hard filter, not a score: a candidate can be able to work the
 * hours and still be excluded from a role that requires citizenship,
 * permanent residence or a security clearance. It only runs when the
 * candidate's profile says they are not a citizen or resident.
 *
 * Two rules that are easy to get wrong:
 *  1. Silence is not permission. Large employers often gate eligibility on
 *     their own careers page rather than in the advert.
 *  2. A company-wide "international applicants welcome" is not role-level
 *     permission; the specific role or programme may not be covered.
 *
 * The result always quotes the wording it relied on, so the user can judge it.
 *
 * Approach adapted from the eligibility gate in MadsLorentzen/ai-job-search
 * (MIT); the patterns here are written for New Zealand postings.
 */

export type EligibilityVerdict =
  | "fail"
  | "pass"
  | "unverified"
  | "not-needed"
  | "unknown";

export type EligibilityResult = {
  verdict: EligibilityVerdict;
  headline: string;
  /** Verbatim sentence the verdict rests on, when there is one. */
  quote: string | null;
  notes: string[];
};

export type EligibilityInput = {
  jobDescription: string;
  workRightsRequirement?: string | null;
  sponsorshipAvailable?: boolean | null;
  candidateWorkRights: string;
  company?: string | null;
  industry?: string | null;
};

export type CandidateWorkStatus =
  | "citizen-or-resident"
  | "needs-permit"
  | "unknown";

const PENDING = /\b(applying|applied|pending|seeking|hoping|planning|waiting)\b/i;
const RESIDENT =
  /\b(citizen|citizenship|permanent resident|resident visa|nz resident|new zealand resident|residence visa)\b/i;
const NEEDS_PERMIT =
  /\b(visa|permit|student|post[- ]?study|pswv|work rights|open work|working holiday|sponsor)/i;

export function classifyCandidateStatus(
  workRights: string,
): CandidateWorkStatus {
  const text = workRights.trim();
  if (!text) {
    return "unknown";
  }
  if (RESIDENT.test(text) && !PENDING.test(text)) {
    return "citizen-or-resident";
  }
  if (NEEDS_PERMIT.test(text) || PENDING.test(text)) {
    return "needs-permit";
  }
  return "unknown";
}

const SOFT = /\b(preferred|desirable|ideal|an advantage|advantageous|bonus|nice to have|an asset)\b/i;

const CLEARANCE =
  /\b(security clearance|nzsis|baseline vetting|security vetting|security vetted|national security clearance)\b/i;

const CITIZEN_PR_REQUIRED: RegExp[] = [
  /\b(must|need to|required to|have to)\b.{0,40}\b(be|hold|have)\b.{0,30}\b(a )?(citizen|citizenship|permanent resident|permanent residency|nz resident|new zealand resident|resident visa|residency)\b/i,
  /\b(citizens?|permanent residents?|residents?)\b.{0,20}\b(only|required)\b/i,
  /\b(nz|new zealand)\s+(citizens?|citizenship|residents?|permanent residents?)\b.{0,15}\b(only|required|essential)\b/i,
  /\b(citizenship|permanent residency|residency)\b.{0,15}\b(is )?(required|essential|mandatory)\b/i,
  /\b(open|available|restricted|limited)\s+(only\s+)?to\b.{0,30}\b(citizens?|residents?)\b/i,
];

// Wording that could mean "any permit" or "citizen/PR only".
const AMBIGUOUS_RIGHTS =
  /\b(right|rights|entitled|eligible)\s+to\s+work\b|\bwork(ing)? rights\b|\bvalid (work )?visa\b|\bwork visa\b/i;

const NEGATED_SPONSORSHIP =
  /\b(no|not|unable|cannot|can't|don't|do not|won't|will not|without)\b.{0,30}\b(sponsor\w*)/i;

const POSITIVE: RegExp[] = [
  /\b(we sponsor|sponsor(ship|ing)?)\b.{0,25}\b(available|provided|offered|supported)\b/i,
  /\bvisa\b.{0,15}\b(available|supported)\b/i,
  /\binternational (students?|applicants?|graduates?|candidates?)\b.{0,30}\b(welcome|encouraged|considered|eligible)\b/i,
  /\b(visa|permit) holders?\b.{0,25}\b(welcome|considered|encouraged|eligible)\b/i,
  /\bopen (work|post[- ]?study)\b.{0,20}\b(visa|rights)\b.{0,20}\b(welcome|accepted|considered)\b/i,
  /\bpost[- ]?study work (visa|rights)\b/i,
];

// The sentence names the kind of permit a graduate or student would hold.
const NAMES_PERMIT =
  /\b(student visa|post[- ]?study|graduate visa|open work|visa holders?|international (students?|graduates?))\b/i;

const CITIZEN_PR_WORDS =
  /\b(citizens?|citizenship|permanent residen\w+|residents?|security clearance|vetting)\b/i;

const HIGH_RISK =
  /\b(government|ministry|defence|defense|bank|banking|telecom\w*|telco|critical infrastructure|crown|public sector|council|audit|consulting)\b/i;

function splitSentences(text: string): string[] {
  return text
    .split(/\r?\n|(?<=[.!?;])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function trimQuote(sentence: string): string {
  return sentence.length > 220 ? `${sentence.slice(0, 217)}...` : sentence;
}

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const status = classifyCandidateStatus(input.candidateWorkRights);

  if (status === "citizen-or-resident") {
    return {
      verdict: "not-needed",
      headline:
        "Your profile says you already hold citizenship or residence, so the work-rights check does not apply.",
      quote: null,
      notes: [],
    };
  }

  if (status === "unknown") {
    return {
      verdict: "unknown",
      headline:
        "Add your work rights to your Candidate Profile to run the eligibility check.",
      quote: null,
      notes: [],
    };
  }

  const sentences = splitSentences(
    `${input.workRightsRequirement ?? ""}\n${input.jobDescription}`,
  );
  const notes: string[] = [];

  const negated = sentences.find((sentence) =>
    NEGATED_SPONSORSHIP.test(sentence),
  );
  if (negated || input.sponsorshipAvailable === false) {
    notes.push(
      "The employer does not offer visa sponsorship. That only matters if your current permit would expire during the role.",
    );
  }

  const failSentence = sentences.find(
    (sentence) =>
      !SOFT.test(sentence) &&
      (CLEARANCE.test(sentence) ||
        CITIZEN_PR_REQUIRED.some((pattern) => pattern.test(sentence))),
  );
  if (failSentence) {
    return {
      verdict: "fail",
      headline:
        "This role appears to require citizenship, residence or a security clearance.",
      quote: trimQuote(failSentence),
      notes: [
        "A security clearance is normally limited to citizens or residents; check the specific scheme before ruling the role out.",
        ...notes,
      ],
    };
  }

  const softSentence = sentences.find(
    (sentence) => SOFT.test(sentence) && CITIZEN_PR_WORDS.test(sentence),
  );
  if (softSentence) {
    notes.push(
      "Citizenship, residence or clearance is described as preferred, not required.",
    );
  }

  const positive = sentences.find(
    (sentence) =>
      !NEGATED_SPONSORSHIP.test(sentence) &&
      POSITIVE.some((pattern) => pattern.test(sentence)),
  );
  if (positive) {
    if (!NAMES_PERMIT.test(positive)) {
      notes.push(
        "This looks like a general welcome. Check that this specific role or programme is covered, not just the company.",
      );
    }
    return {
      verdict: "pass",
      headline: NAMES_PERMIT.test(positive)
        ? "The posting names applicants on your kind of permit."
        : "The posting says international applicants or visa holders are accepted.",
      quote: trimQuote(positive),
      notes,
    };
  }

  if (input.sponsorshipAvailable === true) {
    return {
      verdict: "pass",
      headline:
        "You recorded that visa sponsorship is available for this role.",
      quote: null,
      notes: [
        "This comes from the sponsorship field you filled in, not from the posting text.",
        ...notes,
      ],
    };
  }

  const ambiguous = sentences.find((sentence) =>
    AMBIGUOUS_RIGHTS.test(sentence),
  );
  if (ambiguous) {
    notes.push(
      "The employer may mean any valid work visa, or may mean citizens and residents only. Check their careers or graduate page.",
    );
  } else {
    notes.push(
      "The posting is silent on work rights. Silence is not permission: check the employer's careers or graduate page before drafting.",
    );
  }

  const context = `${input.company ?? ""} ${input.industry ?? ""} ${input.jobDescription}`;
  if (HIGH_RISK.test(context)) {
    notes.push(
      "Government, banking, telecommunications, consulting and critical-infrastructure employers often restrict eligibility on their own website.",
    );
  }

  return {
    verdict: "unverified",
    headline: "Eligibility is not confirmed for your work rights.",
    quote: ambiguous ? trimQuote(ambiguous) : null,
    notes,
  };
}
