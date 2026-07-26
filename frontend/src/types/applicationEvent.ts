export type ApplicationEvent = {
  id: number;
  applicationId: number;
  stage: string;
  occurredAt: string;
  contactPerson: string | null;
  notes: string | null;
  nextAction: string | null;
  followUpDueDate: string | null;
  completed: boolean;
  createdAt: string;
};

export type CreateApplicationEventRequest = {
  stage: string;
  occurredAt: string;
  contactPerson: string;
  notes: string;
  nextAction: string;
  followUpDueDate: string | null;
};
