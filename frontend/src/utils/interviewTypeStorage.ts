import type { InterviewType } from "./interviewFocus";

const KEY = "kiwihire.interviewType";

/** The round the person last chose. Storage can be blocked, so fall back. */
export function readInterviewType(): InterviewType {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "hr" ? "hr" : "business";
  } catch {
    return "business";
  }
}

export function saveInterviewType(type: InterviewType): void {
  try {
    window.localStorage.setItem(KEY, type);
  } catch {
    // Remembering the choice is a convenience only.
  }
}
