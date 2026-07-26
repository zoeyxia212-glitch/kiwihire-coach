export type LearningGoalStatus =
  | "To learn"
  | "In progress"
  | "Completed";

export type LearningGoal = {
  id: number;
  skill: string;
  reason: string;
  status: LearningGoalStatus;
  sourceReviewId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLearningGoalRequest = {
  skill: string;
  reason: string;
  sourceReviewId: number | null;
};
