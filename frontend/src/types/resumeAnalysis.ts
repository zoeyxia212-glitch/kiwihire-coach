export type ResumeAnalysisItem = {
  skill: string;
  evidence?: string;
  explanation: string;
};

export type ResumeAnalysis = {
  score: number | null;
  matched: ResumeAnalysisItem[];
  missing: ResumeAnalysisItem[];
  transferable: ResumeAnalysisItem[];
  suggestions: string[];
};
