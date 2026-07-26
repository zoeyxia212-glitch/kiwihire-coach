export type DashboardFollowUp = {
  eventId: number;
  applicationId: number;
  company: string;
  roleTitle: string;
  stage: string;
  nextAction: string | null;
  followUpDueDate: string;
  overdue: boolean;
};

export type DashboardApplication = {
  id: number;
  company: string;
  roleTitle: string;
  status: string;
  createdAt: string;
};

export type Dashboard = {
  totalApplications: number;
  interviewApplications: number;
  dueToday: number;
  overdue: number;
  followUps: DashboardFollowUp[];
  recentApplications: DashboardApplication[];
};
