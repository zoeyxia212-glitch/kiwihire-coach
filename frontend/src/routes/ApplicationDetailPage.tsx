import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import type { Application } from "../types/application";
import { API_BASE_URL } from "../utils/api";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
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

        const data = await response.json();
        setApplication(data);
      } catch {
        setErrorMessage("Failed to load application.");
      }
    }

    fetchApplication();
  }, [id]);

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  if (!application) {
    return <p className="muted">Loading application...</p>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Application</p>
          <h1>
            {application.company} · {application.roleTitle}
          </h1>
          <p className="muted">
            {application.location || "No location"}
            {` · ${application.userEmail}`}
            {application.closingDate &&
              ` · Closes ${application.closingDate}`}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid two">
        <div className="panel">
          <div className="panel-inner">
            <h2>Job description</h2>
            <p className="muted">
              {application.jobDescription || "No job description provided."}
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="panel-inner">
            <h2>Application details</h2>
            <p className="muted">Status: {application.status}</p>
            <p className="muted">Created: {application.createdAt}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
