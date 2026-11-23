/**
 * Interview type focus.
 *
 * A business round (technical, manager, panel) probes project detail and
 * role skills. An HR round probes motivation, teamwork, reliability and
 * plans. The type does not change the questions stored in a review, because
 * saved answers are indexed by position. It changes which questions to
 * practise first, and which extra HR questions are offered.
 *
 * Two types only, as in XiaqiuOO/interview-ready-skill (no licence file, so
 * only the idea is used, not its wording).
 */

export type InterviewType = "business" | "hr";

export type InterviewQuestionCategory =
  | "Behavioural"
  | "Situational"
  | "Technical";

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  business: "Business or technical round",
  hr: "HR or culture round",
};

export function questionCategory(question: {
  question: string;
}): InterviewQuestionCategory {
  const text = question.question.toLowerCase();

  if (
    text.includes("what would you") ||
    text.includes("how would you") ||
    text.includes("imagine") ||
    text.includes("suppose") ||
    text.includes("if you were")
  ) {
    return "Situational";
  }

  if (
    text.includes("tell me about a time") ||
    text.includes("describe a time") ||
    text.includes("give an example") ||
    text.includes("conflict") ||
    text.includes("feedback") ||
    text.includes("worked in a team")
  ) {
    return "Behavioural";
  }

  return "Technical";
}

/** 1-based numbers of the questions that suit the round best. */
export function focusQuestionNumbers(
  questions: { question: string }[],
  type: InterviewType,
): number[] {
  return questions
    .map((question, index) => ({
      number: index + 1,
      category: questionCategory(question),
    }))
    .filter(({ category }) =>
      type === "business"
        ? category === "Technical"
        : category !== "Technical",
    )
    .map(({ number }) => number);
}

export type HrPrompt = {
  question: string;
  answerGuide: string;
};

/**
 * Fixed HR round questions. They are generic on purpose: nothing here is
 * claimed about the company, so there is nothing to verify.
 */
export const HR_PROMPTS: HrPrompt[] = [
  {
    question: "Why do you want this role, and why this company?",
    answerGuide:
      "Name one thing about the role and one thing about the company that you checked yourself. Link both to what you want to learn or contribute.",
  },
  {
    question: "Tell me about a time you worked with someone you disagreed with.",
    answerGuide:
      "Situation, what you did, result. Show that you listened first and kept the work moving. No blaming.",
  },
  {
    question: "Tell me about a time you made a mistake at work.",
    answerGuide:
      "Pick a real one with limited impact. Say what you changed afterwards so it did not happen again.",
  },
  {
    question: "How do you handle a deadline you are going to miss?",
    answerGuide:
      "Say you raise it early, explain what is at risk, and offer options. Give one real example if you have it.",
  },
  {
    question: "Where do you want to be in two to three years?",
    answerGuide:
      "Keep it about skills and responsibility, and tie it to this role. Avoid titles and avoid sounding like you will leave quickly.",
  },
];
