import { useEffect, useState } from "react";
import ApplicationCard from "../components/ApplicationCard";
import type { Application } from "../types/application";
import { getApplicationsForUser } from "../utils/api";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await getApplicationsForUser(1);
        setApplications(data);
      } catch {
        setErrorMessage("Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1>Applications</h1>
          <p className="muted">
            Keep every role, deadline, and next step in one place.
          </p>
        </div>
        <a className="button primary" href="/applications/new">
          New application
        </a>
      </div>

      <div className="panel">
        <div className="panel-inner list">
          {isLoading && <p className="muted">Loading applications...</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {!isLoading &&
            !errorMessage &&
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
