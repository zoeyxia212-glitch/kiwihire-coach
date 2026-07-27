import type { CandidateProfile } from "../types/candidateProfile";

const profileFields = [
  { key: "targetRoles", label: "target roles" },
  { key: "workRights", label: "work rights" },
  { key: "preferredLocations", label: "preferred locations" },
  { key: "technicalSkills", label: "technical skills" },
  { key: "experienceSummary", label: "experience summary" },
] as const;

export function getCandidateProfileProgress(
  profile: CandidateProfile,
) {
  const missing = profileFields
    .filter(({ key }) => !profile[key].trim())
    .map(({ label }) => label);
  const completed = profileFields.length - missing.length;

  return {
    completed,
    total: profileFields.length,
    percentage: Math.round(
      (completed / profileFields.length) * 100,
    ),
    missing,
  };
}
