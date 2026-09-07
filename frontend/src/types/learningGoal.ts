export type LearningGoalStatus =
  | "To learn"
  | "In progress"
  | "Completed";

export type LearningGoal = {
  id: number;
  skill: string;
  reason: string;
  status: LearningGoalStatus;
  nextAction: string;
  targetDate: string | null;
  outcomeEvidence: string;
  completedAt: string | null;
  sourceReviewId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateLearningGoalRequest = {
  status: LearningGoalStatus;
  nextAction: string;
  targetDate: string | null;
  outcomeEvidence: string;
};

export type CreateLearningGoalRequest = {
  skill: string;
  reason: string;
  sourceReviewId: number | null;
};

export type SkillGapInsight = {
  skill: string;
  applicationCount: number;
  exampleRoles: string[];
  sourceReviewId: number;
  learningGoalId: number | null;
  learningGoalStatus: LearningGoalStatus | null;
};
