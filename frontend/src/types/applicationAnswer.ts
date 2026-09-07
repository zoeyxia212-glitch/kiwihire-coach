export type ApplicationAnswer = {
  id: number;
  question: string;
  answer: string;
  tags: string;
  roleTypes: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveApplicationAnswerRequest = Omit<
  ApplicationAnswer,
  "id" | "createdAt" | "updatedAt"
>;
