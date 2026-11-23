/**
 * Decides which interview questions deserve practice first.
 *
 * Priority, highest first:
 *  1. Feedback  - the skill came up in earlier feedback (mock-interview
 *                 improvement notes or interview notes). Anything flagged or
 *                 doubted before is the most likely to come back.
 *  2. Gap       - the skill is a gap in this resume review. Gaps are the
 *                 likeliest probes, and need an honest bridging answer.
 *  3. Requirement - the posting asks for the skill.
 *  4. General   - everything else.
 *
 * The questions are not reordered: saved answers are stored by question
 * position, so moving them would attach answers to the wrong question.
 * The priority is shown beside each question instead.
 *
 * Ordering adapted from the /interview prep rules in
 * MadsLorentzen/ai-job-search (MIT).
 */

import type { ApplicationEvent } from "../types/applicationEvent";

export type QuestionPriorityKind =
  | "feedback"
  | "gap"
  | "requirement"
  | "general";

export type QuestionPriority = {
  kind: QuestionPriorityKind;
  label: string;
  detail: string;
};

export type PriorityContext = {
  feedbackTexts: string[];
  missingSkills: string[];
  jobDescription: string;
};

const LABELS: Record<QuestionPriorityKind, string> = {
  feedback: "Raised before",
  gap: "Gap to bridge",
  requirement: "In the posting",
  general: "General",
};

const DETAILS: Record<QuestionPriorityKind, string> = {
  feedback: "This topic came up in your earlier feedback or notes.",
  gap: "This is a gap in your resume review. Prepare an honest bridge.",
  requirement: "The posting asks for this skill.",
  general: "A general question for this role.",
};

function skillTerms(relatedSkill: string): string[] {
  return relatedSkill
    .toLowerCase()
    .split(/[\/,&]|\band\b/)
    .map((term) => term.trim())
    .filter((term) => term && term !== "general");
}

function mentions(text: string, term: string): boolean {
  if (term === "database") {
    return /\b(sql|postgres\w*|mongo\w*|database)\b/.test(text);
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(text);
}

export function rankQuestionPriorities(
  questions: { relatedSkill: string }[],
  context: PriorityContext,
): QuestionPriority[] {
  const feedback = context.feedbackTexts.join("\n").toLowerCase();
  const missing = context.missingSkills.map((skill) => skill.toLowerCase());
  const posting = context.jobDescription.toLowerCase();

  return questions.map((question) => {
    const terms = skillTerms(question.relatedSkill);
    let kind: QuestionPriorityKind = "general";

    if (terms.some((term) => mentions(feedback, term))) {
      kind = "feedback";
    } else if (
      terms.some((term) => missing.some((skill) => mentions(skill, term)))
    ) {
      kind = "gap";
    } else if (terms.some((term) => mentions(posting, term))) {
      kind = "requirement";
    }

    return { kind, label: LABELS[kind], detail: DETAILS[kind] };
  });
}

/** 1-based question numbers worth practising first (feedback and gaps). */
export function practiseFirst(priorities: QuestionPriority[]): number[] {
  return priorities
    .map((priority, index) => ({ priority, number: index + 1 }))
    .filter(
      ({ priority }) => priority.kind === "feedback" || priority.kind === "gap",
    )
    .map(({ number }) => number);
}

type FeedbackReview = {
  applicationId: number;
  mockInterviewSessions: { improvementNotes: string }[];
};

/** Improvement notes from earlier mock interviews of one application. */
export function collectPriorFeedback(
  reviews: FeedbackReview[],
  applicationId: number,
): string[] {
  return reviews
    .filter((review) => review.applicationId === applicationId)
    .flatMap((review) =>
      review.mockInterviewSessions.map((session) => session.improvementNotes),
    )
    .map((note) => note.trim())
    .filter(Boolean);
}

/** Notes written on the application timeline (interviews, calls, rejections). */
export function collectEventNotes(
  events: Pick<ApplicationEvent, "notes">[],
): string[] {
  return events
    .map((event) => (event.notes ?? "").trim())
    .filter(Boolean);
}
