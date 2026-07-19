import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApplicationForm, {
  type ApplicationFormValues,
} from "../components/ApplicationForm";
import type { Application } from "../types/application";
import { API_BASE_URL } from "../utils/api";

export default function EditApplicationPage() {
  const { id } = useParams();
  const [initialValues, setInitialValues] =
    useState<ApplicationFormValues | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchApplication() {
      if (!id) {
        setErrorMessage("Application ID is missing.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/applications/${id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load application.");
        }

        const application: Application = await response.json();

        setInitialValues({
          company: application.company,
          roleTitle: application.roleTitle,
          location: application.location ?? "",
          status: application.status,
          jobDescription: application.jobDescription,
          closingDate: application.closingDate ?? "",
        });
      } catch {
        setErrorMessage("Failed to load application.");
      }
    }

    fetchApplication();
  }, [id]);

  async function handleUpdate(values: ApplicationFormValues) {
    if (!id) {
      throw new Error("Application ID is missing.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/applications/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update application.");
    }

    window.location.href = `/applications/${id}`;
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  if (!initialValues) {
    return <p>Loading application...</p>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Edit application</p>
          <h1>Update application.</h1>
          <p className="muted">
            Update the role information and application status.
          </p>
        </div>
      </div>

      <ApplicationForm
        initialValues={initialValues}
        submitLabel="Update application"
        onSubmit={handleUpdate}
      />
    </section>
  );
}
