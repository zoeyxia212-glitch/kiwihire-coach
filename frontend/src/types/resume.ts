export type Resume = {
  id: number;
  name: string;
  purpose: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveResumeRequest = {
  name: string;
  purpose: string;
  content: string;
};
