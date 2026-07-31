export type CandidateProfile = {
  id: number | null;
  targetRoles: string;
  workRights: string;
  preferredLocations: string;
  careerStage: string;
  technicalSkills: string;
  experienceSummary: string;
  starExamples: string;
  updatedAt: string | null;
};

export type SaveCandidateProfileRequest = Omit<
  CandidateProfile,
  "id" | "updatedAt"
>;
