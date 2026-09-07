export type EvidenceItem = {
  id: number;
  title: string;
  context: string;
  action: string;
  result: string;
  skills: string;
  sourceLearningGoalId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SaveEvidenceItemRequest = Omit<
  EvidenceItem,
  "id" | "createdAt" | "updatedAt" | "sourceLearningGoalId"
>;
