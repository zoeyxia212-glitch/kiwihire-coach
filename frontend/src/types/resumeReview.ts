import type { ResumeAnalysisItem } from "./resumeAnalysis";

export type SavedReviewQuestion = {
  question: string;
  reason: string;
  answerGuide: string;
  relatedSkill: string;
};

export type CreateResumeReviewRequest = {
  applicationId: number;
  resumeId: number;
  score: number | null;
  matched: ResumeAnalysisItem[];
  transferable: ResumeAnalysisItem[];
  missing: ResumeAnalysisItem[];
  suggestions: string[];
  questions: SavedReviewQuestion[];
};

export type ResumeReview = CreateResumeReviewRequest & {
  id: number;
  company: string;
  roleTitle: string;
  resumeName: string;
  helpful: boolean | null;
  feedbackComment: string | null;
  workflowIntent: WorkflowIntent;
  suggestionStatuses: SuggestionStatus[];
  answers: string[];
  answerStatuses: InterviewAnswerStatus[];
  createdAt: string;
};

export type SuggestionStatus = "To do" | "Accepted" | "Ignored";
export type WorkflowIntent = "Yes" | "Maybe" | "No" | null;

export type InterviewAnswerStatus =
  | "Not started"
  | "Drafted"
  | "Ready";
