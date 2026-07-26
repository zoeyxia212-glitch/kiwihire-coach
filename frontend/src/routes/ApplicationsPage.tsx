import { useEffect, useState } from "react";
import { Link } from "react-router";
import ApplicationCard from "../components/ApplicationCard";
import type {
  Application,
  ApplicationStatus,
} from "../types/application";
import { getApplications } from "../utils/api";

type StatusFilter = "All" | "Interview stages" | ApplicationStatus;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch {
        setErrorMessage("Failed to load applications.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredApplications = applications.filter((application) => {
    const searchableText = [
      application.company,
      application.roleTitle,
      application.location,
      application.source,
      application.contactPerson,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Interview stages"
        ? isInterviewStage(application.status)
        : application.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const hasFilters =
    Boolean(normalizedSearch) || statusFilter !== "All";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
  }

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
        <Link className="button primary" to="/applications/new">
          New application
        </Link>
      </div>

      <div className="panel application-filters">
        <div className="panel-inner">
          <div className="field">
            <label htmlFor="application-search">
              Search applications
            </label>
            <input
              id="application-search"
              type="search"
              value={searchTerm}
              placeholder="Company, role, location, source..."
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="application-status-filter">Status</label>
            <select
              id="application-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option>All</option>
              <option>Saved</option>
              <option>Applied</option>
              <option>Interview stages</option>
              <option>Offer</option>
              <option>Rejected</option>
              <option>Withdrawn</option>
            </select>
          </div>
          <div className="filter-summary">
            <span>
              {filteredApplications.length} of {applications.length}{" "}
              applications
            </span>
            {hasFilters && (
              <button
                className="text-button"
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-inner list">
          {isLoading && <p className="muted">Loading applications...</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {!isLoading &&
            !errorMessage &&
            filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}
          {!isLoading &&
            !errorMessage &&
            filteredApplications.length === 0 && (
              <div>
                <h2>
                  {hasFilters
                    ? "No applications match these filters"
                    : "No applications yet"}
                </h2>
                <p className="muted">
                  {hasFilters
                    ? "Try another company, role, location, or status."
                    : "Save your first role to start tracking your pipeline."}
                </p>
                {hasFilters ? (
                  <button
                    className="button"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link
                    className="button primary"
                    to="/applications/new"
                  >
                    Add first application
                  </Link>
                )}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}

function isInterviewStage(status: ApplicationStatus) {
  return [
    "Recruiter Screen",
    "First Interview",
    "Second Interview",
    "Technical Interview",
    "Reference Check",
  ].includes(status);
}
