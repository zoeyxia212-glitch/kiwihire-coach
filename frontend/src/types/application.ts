export type ApplicationStatus = "Saved" | "Applied" | "Interview" | "Rejected" | "Offer";

export type Application = {
  id: string;
  company: string;
  roleTitle: string;
  location: string;
  source: string;
  status: ApplicationStatus;
  closingDate: string;
  jobDescription: string;
  createdAt: string;
};