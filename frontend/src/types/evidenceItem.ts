export type EvidenceItem = {
  id: number;
  title: string;
  context: string;
  action: string;
  result: string;
  skills: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveEvidenceItemRequest = Omit<
  EvidenceItem,
  "id" | "createdAt" | "updatedAt"
>;
