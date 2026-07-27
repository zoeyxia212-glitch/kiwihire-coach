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

export type DashboardReminder = {
  type: "Interview" | "Follow-up" | "Closing date";
  applicationId: number;
  company: string;
  roleTitle: string;
  title: string;
  dueAt: string;
};

export type DashboardInactiveApplication = {
  applicationId: number;
  company: string;
  roleTitle: string;
  status: string;
  lastActivityAt: string;
};

export type Dashboard = {
  totalApplications: number;
  interviewApplications: number;
  dueToday: number;
  overdue: number;
  followUps: DashboardFollowUp[];
  upcomingReminders: DashboardReminder[];
  inactiveApplications: DashboardInactiveApplication[];
  recentApplications: DashboardApplication[];
};
