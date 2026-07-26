export type CandidateProfile = {
  id: number | null;
  targetRoles: string;
  workRights: string;
  preferredLocations: string;
  technicalSkills: string;
  experienceSummary: string;
  updatedAt: string | null;
};

export type SaveCandidateProfileRequest = Omit<
  CandidateProfile,
  "id" | "updatedAt"
>;
