import type { Application } from "../types/application";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type CreateApplicationRequest = {
  userId: number;
  company: string;
  roleTitle: string;
  location: string;
  status: Application["status"];
  jobDescription: string;
  closingDate: string;
};

export type UpdateApplicationRequest = Omit<
  CreateApplicationRequest,
  "userId"
>;

export async function getApplicationById(
  id: string,
): Promise<Application> {
  const response = await fetch(
    `${API_BASE_URL}/api/applications/${id}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load application.");
  }

  return response.json();
}

export async function getApplicationsForUser(
  userId: number,
): Promise<Application[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/applications/user/${userId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load applications.");
  }

  return response.json();
}

export async function createApplication(
  request: CreateApplicationRequest,
): Promise<Application> {
  const response = await fetch(
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
  const response = await fetch(
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

export async function deleteApplication(
  id: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/applications/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete application.");
  }
}
