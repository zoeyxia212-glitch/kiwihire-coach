export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Recruiter Screen"
  | "First Interview"
  | "Second Interview"
  | "Technical Interview"
  | "Reference Check"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type Application = {
  id: number;
  company: string;
  roleTitle: string;
  location: string | null;
  status: ApplicationStatus;
  jobDescription: string;
  closingDate: string | null;
  createdAt: string;
  userId: number;
  userEmail: string;
  source: string | null;
  workMode: string | null;
  workRightsRequirement: string | null;
  salaryRange: string | null;
  contactPerson: string | null;
  jobUrl: string | null;
  archived: boolean;
};
