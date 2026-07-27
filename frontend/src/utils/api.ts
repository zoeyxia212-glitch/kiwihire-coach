import type { Application } from "../types/application";
import type {
  ApplicationEvent,
  CreateApplicationEventRequest,
} from "../types/applicationEvent";
import type { Dashboard } from "../types/dashboard";
import type {
  CandidateProfile,
  SaveCandidateProfileRequest,
} from "../types/candidateProfile";
import type {
  CreateLearningGoalRequest,
  LearningGoal,
  LearningGoalStatus,
} from "../types/learningGoal";
import type {
  Resume,
  SaveResumeRequest,
} from "../types/resume";
import type {
  CreateResumeReviewRequest,
  InterviewAnswerStatus,
  ResumeReview,
  SuggestionStatus,
  WorkflowIntent,
} from "../types/resumeReview";
import {
  clearAuthSession,
  getAuthToken,
  saveAuthMessage,
} from "./auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}

export type CreateApplicationRequest = {
  company: string;
  roleTitle: string;
  location: string;
  status: Application["status"];
  jobDescription: string;
  closingDate: string;
  source: string;
  workMode: string;
  workRightsRequirement: string;
  salaryRange: string;
  contactPerson: string;
  jobUrl: string;
};

export type UpdateApplicationRequest = CreateApplicationRequest;

export type RegisterRequest = {
  email: string;
  password: string;
};

export type UserResponse = {
  id: number;
  email: string;
  createdAt: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  email: string;
  token: string;
};

async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearAuthSession();
    saveAuthMessage(
      "Your login session expired. Log in again to continue.",
    );
    window.location.assign("/login");
  }

  return response;
}

export async function registerUser(
  request: RegisterRequest,
): Promise<UserResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    if (response.status === 409) {
      const message = await response.text();
      throw new Error(
        message || "An account already exists for this email.",
      );
    }

    throw new Error(
      "We could not create your account. Check your details and try again.",
    );
  }

  return response.json();
}

export async function getAccount(): Promise<UserResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/account`,
  );

  if (!response.ok) {
    throw new Error("Failed to load account.");
  }

  return response.json();
}

export async function changePassword(
  request: ChangePasswordRequest,
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/account/password`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(
      (await response.text()) || "Failed to change password.",
    );
  }
}

export async function deleteAccount(
  currentPassword: string,
  confirmation: string,
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/account`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, confirmation }),
    },
  );

  if (!response.ok) {
    throw new Error(
      (await response.text()) || "Failed to delete account.",
    );
  }
}

export async function loginUser(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Email or password is incorrect.");
    }

    throw new Error(
      "We could not log you in. Please try again.",
    );
  }

  return response.json();
}

export async function getApplicationById(
  id: string,
): Promise<Application> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications/${id}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new ResourceNotFoundError("Application not found.");
    }
    throw new Error("Failed to load application.");
  }

  return response.json();
}

export async function getApplications(): Promise<Application[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications`,
  );

  if (!response.ok) {
    throw new Error("Failed to load applications.");
  }

  return response.json();
}

export async function createApplication(
  request: CreateApplicationRequest,
): Promise<Application> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create application.");
  }

  return response.json();
}

export async function updateApplication(
  id: string,
  request: UpdateApplicationRequest,
): Promise<Application> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update application.");
  }

  return response.json();
}

export async function updateApplicationArchived(
  id: number,
  archived: boolean,
): Promise<Application> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications/${id}/archive`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(archived),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update application archive.");
  }

  return response.json();
}

export async function deleteApplication(
  id: string,
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete application.");
  }
}

export async function getApplicationEvents(
  applicationId: string,
): Promise<ApplicationEvent[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications/${applicationId}/events`,
  );

  if (!response.ok) {
    throw new Error("Failed to load application history.");
  }

  return response.json();
}

export async function createApplicationEvent(
  applicationId: string,
  request: CreateApplicationEventRequest,
): Promise<ApplicationEvent> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications/${applicationId}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save application update.");
  }

  return response.json();
}

export async function completeApplicationEvent(
  applicationId: string,
  eventId: number,
): Promise<ApplicationEvent> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/applications/${applicationId}/events/${eventId}/complete`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to complete follow-up.");
  }

  return response.json();
}

export async function getDashboard(): Promise<Dashboard> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/dashboard`,
  );

  if (!response.ok) {
    throw new Error("Failed to load dashboard.");
  }

  return response.json();
}

export async function getCandidateProfile(): Promise<CandidateProfile> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/profile`,
  );

  if (!response.ok) {
    throw new Error("Failed to load candidate profile.");
  }

  return response.json();
}

export async function saveCandidateProfile(
  request: SaveCandidateProfileRequest,
): Promise<CandidateProfile> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save candidate profile.");
  }

  return response.json();
}

export async function getLearningGoals(): Promise<LearningGoal[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/learning-goals`,
  );

  if (!response.ok) {
    throw new Error("Failed to load learning goals.");
  }

  return response.json();
}

export async function createLearningGoal(
  request: CreateLearningGoalRequest,
): Promise<LearningGoal> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/learning-goals`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create learning goal.");
  }

  return response.json();
}

export async function updateLearningGoal(
  goalId: number,
  status: LearningGoalStatus,
): Promise<LearningGoal> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/learning-goals/${goalId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update learning goal.");
  }

  return response.json();
}

export async function deleteLearningGoal(
  goalId: number,
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/learning-goals/${goalId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete learning goal.");
  }
}

export async function getResumes(): Promise<Resume[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/resumes`,
  );

  if (!response.ok) {
    throw new Error("Failed to load resumes.");
  }

  return response.json();
}

export async function createResume(
  request: SaveResumeRequest,
): Promise<Resume> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/resumes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save resume.");
  }

  return response.json();
}

export async function updateResume(
  resumeId: number,
  request: SaveResumeRequest,
): Promise<Resume> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/resumes/${resumeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update resume.");
  }

  return response.json();
}

export async function deleteResume(resumeId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/resumes/${resumeId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete resume.");
  }
}

export async function getResumeReviews(): Promise<ResumeReview[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews`,
  );

  if (!response.ok) {
    throw new Error("Failed to load review history.");
  }

  return response.json();
}

export async function getResumeReviewById(
  reviewId: string,
): Promise<ResumeReview> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews/${reviewId}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new ResourceNotFoundError("Review not found.");
    }
    throw new Error("Failed to load saved review.");
  }

  return response.json();
}

export async function deleteResumeReview(
  reviewId: number,
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews/${reviewId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete saved review.");
  }
}

export async function updateResumeReviewFeedback(
  reviewId: number,
  helpful: boolean,
  comment: string,
  workflowIntent: WorkflowIntent,
): Promise<ResumeReview> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews/${reviewId}/feedback`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ helpful, comment, workflowIntent }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save review feedback.");
  }

  return response.json();
}

export async function updateResumeReviewAnswers(
  reviewId: number,
  answers: string[],
): Promise<ResumeReview> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews/${reviewId}/answers`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save practice answers.");
  }

  return response.json();
}

export async function updateResumeReviewAnswerStatus(
  reviewId: number,
  questionIndex: number,
  status: InterviewAnswerStatus,
): Promise<ResumeReview> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews/${reviewId}/answers/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questionIndex, status }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update answer status.");
  }

  return response.json();
}

export async function updateResumeReviewSuggestionStatus(
  reviewId: number,
  suggestionIndex: number,
  status: SuggestionStatus,
): Promise<ResumeReview> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews/${reviewId}/suggestions/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ suggestionIndex, status }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update suggestion status.");
  }

  return response.json();
}

export async function createResumeReview(
  request: CreateResumeReviewRequest,
): Promise<ResumeReview> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save review.");
  }

  return response.json();
}
