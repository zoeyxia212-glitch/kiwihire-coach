import type { Application } from "../types/application";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
