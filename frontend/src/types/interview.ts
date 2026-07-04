export type InterviewQuestion = {
  id: string;
  question: string;
  reason: string;
  answerGuide: string;
  relatedSkill: string;
};

export type InterviewPrep = {
  id: string;
  applicationId: string;
  resumeId: string;
  questions: InterviewQuestion[];
  createdAt: string;
};