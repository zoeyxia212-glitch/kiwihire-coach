export type ApplicationStatus = "Saved" | "Applied" | "Interview" | "Rejected" | "Offer";

export type Application = {
  id: number;
  company: string;
  roleTitle: string;
  status: ApplicationStatus;
  jobDescription: string;
  closingDate: string | null;
  createdAt: string;
  userId: number;
  userEmail: string;
};
