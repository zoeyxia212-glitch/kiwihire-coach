export type ProductFeedbackCategory =
  | "Useful feature"
  | "Problem"
  | "Confusing experience"
  | "Missing feature"
  | "Other";

export type CreateProductFeedbackRequest = {
  category: ProductFeedbackCategory;
  rating: number;
  page: string;
  wouldUseAgain: boolean | null;
  message: string;
};

export type ProductFeedback = CreateProductFeedbackRequest & {
  id: number;
  createdAt: string;
};
