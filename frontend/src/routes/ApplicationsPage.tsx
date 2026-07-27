import { useEffect, useState } from "react";
import { Link } from "react-router";
import ApplicationCard from "../components/ApplicationCard";
import type {
  Application,
  ApplicationStatus,
} from "../types/application";
import { getApplications } from "../utils/api";

type StatusFilter = "All" | "Interview stages" | ApplicationStatus;
type ViewFilter = "Active" | "Archived";
type SortOption =
  | "Recently added"
  | "Closing soon"
  | "Company A–Z"
  | "Status";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [viewFilter, setViewFilter] =
    useState<ViewFilter>("Active");
  const [sortBy, setSortBy] =
    useState<SortOption>("Recently added");
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
  const filteredApplications = applications
    .filter((application) => {
      const matchesView =
        viewFilter === "Archived"
          ? application.archived
          : !application.archived;
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

      return matchesView && matchesSearch && matchesStatus;
    })
    .sort(applicationSorter(sortBy));

  const hasFilters =
    Boolean(normalizedSearch) || statusFilter !== "All";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
  }

  function exportApplications() {
    const headers = [
      "Company",
      "Role title",
      "Location",
      "Status",
      "Source",
      "Work mode",
      "Work rights requirement",
      "Salary range",
      "Contact person",
      "Closing date",
      "Job URL",
      "Created at",
      "Archived",
    ];
    const rows = filteredApplications.map((application) => [
      application.company,
      application.roleTitle,
      application.location,
      application.status,
      application.source,
      application.workMode,
      application.workRightsRequirement,
      application.salaryRange,
      application.contactPerson,
      application.closingDate,
      application.jobUrl,
      application.createdAt,
      application.archived ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");
    const file = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `kiwihire-${viewFilter.toLowerCase()}-applications-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
            <label htmlFor="application-view-filter">View</label>
            <select
              id="application-view-filter"
              value={viewFilter}
              onChange={(event) =>
                setViewFilter(event.target.value as ViewFilter)
              }
            >
              <option>Active</option>
              <option>Archived</option>
            </select>
          </div>
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
          <div className="field">
            <label htmlFor="application-sort">Sort by</label>
            <select
              id="application-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as SortOption)
              }
            >
              <option>Recently added</option>
              <option>Closing soon</option>
              <option>Company A–Z</option>
              <option>Status</option>
            </select>
          </div>
          <div className="filter-summary">
            <span>
              {filteredApplications.length} {viewFilter.toLowerCase()}{" "}
              applications
            </span>
            <button
              className="text-button"
              type="button"
              disabled={filteredApplications.length === 0}
              onClick={exportApplications}
            >
              Export CSV
            </button>
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
                    : viewFilter === "Archived"
                      ? "No archived applications"
                      : "No applications yet"}
                </h2>
                <p className="muted">
                  {hasFilters
                    ? "Try another company, role, location, or status."
                    : viewFilter === "Archived"
                      ? "Applications you archive will remain available here."
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

function applicationSorter(sortBy: SortOption) {
  return (first: Application, second: Application) => {
    if (sortBy === "Closing soon") {
      if (!first.closingDate) {
        return second.closingDate ? 1 : 0;
      }
      if (!second.closingDate) {
        return -1;
      }
      return first.closingDate.localeCompare(second.closingDate);
    }

    if (sortBy === "Company A–Z") {
      return first.company.localeCompare(second.company);
    }

    if (sortBy === "Status") {
      return first.status.localeCompare(second.status);
    }

    return (
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
    );
  };
}

function csvCell(value: string | number | boolean | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
