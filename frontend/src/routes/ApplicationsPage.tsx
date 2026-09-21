import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import ApplicationCard from "../components/ApplicationCard";
import type {
  Application,
  ApplicationStatus,
} from "../types/application";
import { createApplicationEvent, getApplications } from "../utils/api";
import { buildApplicationsCsv } from "../utils/applicationCsv";

type StatusFilter = "All" | "Interview stages" | ApplicationStatus;
type ViewFilter = "Active" | "Archived";
type LayoutMode = "List" | "Board";
type SortOption =
  | "Recently added"
  | "Closing soon"
  | "Company A–Z"
  | "Status";

export default function ApplicationsPage() {
  const [searchParams] = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(
      isApplicationStatus(requestedStatus)
        ? requestedStatus
        : "All",
    );
  const [viewFilter, setViewFilter] =
    useState<ViewFilter>("Active");
  const [sortBy, setSortBy] =
    useState<SortOption>("Recently added");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("List");
  const [draggedApplicationId, setDraggedApplicationId] = useState<number | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [boardMessage, setBoardMessage] = useState("");

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
        application.careerLevel,
        application.employmentType,
        application.industry,
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
    const csv = buildApplicationsCsv(filteredApplications);
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

  async function moveApplication(
    applicationId: number,
    nextStatus: ApplicationStatus,
  ) {
    const application = applications.find((item) => item.id === applicationId);
    if (!application || application.status === nextStatus) return;

    setUpdatingApplicationId(applicationId);
    setBoardMessage("");
    try {
      await createApplicationEvent(String(applicationId), {
        stage: nextStatus,
        occurredAt: localDateTimeValue(),
        contactPerson: application.contactPerson || "",
        notes: `Moved from ${application.status} to ${nextStatus} on the pipeline board.`,
        nextAction: "",
        followUpDueDate: null,
      });
      setApplications((current) => current.map((item) =>
        item.id === applicationId ? { ...item, status: nextStatus } : item
      ));
      setBoardMessage(
        `${application.company} moved to ${nextStatus}. A timeline event was saved.`,
      );
    } catch {
      setBoardMessage("The status could not be updated. Please try again.");
    } finally {
      setUpdatingApplicationId(null);
      setDraggedApplicationId(null);
    }
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

      <div className="application-layout-bar" aria-label="Application layout">
        <div>
          <strong>View applications</strong>
          <span className="muted">Use the board to move roles through the pipeline.</span>
        </div>
        <div className="segmented-control">
          {(["List", "Board"] as LayoutMode[]).map((mode) => (
            <button
              className={layoutMode === mode ? "is-active" : ""}
              type="button"
              key={mode}
              aria-pressed={layoutMode === mode}
              onClick={() => setLayoutMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {boardMessage && <p className="info-message" role="status">{boardMessage}</p>}

      {layoutMode === "List" ? <div className="panel">
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
      </div> : (
        <div className="application-board" aria-label="Application pipeline board">
          {APPLICATION_STATUSES.map((status) => {
            const columnApplications = filteredApplications.filter(
              (application) => application.status === status,
            );
            return (
              <section
                className={`application-board-column${draggedApplicationId ? " accepts-drop" : ""}`}
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedApplicationId !== null) {
                    void moveApplication(draggedApplicationId, status);
                  }
                }}
              >
                <header>
                  <h2>{status}</h2>
                  <span>{columnApplications.length}</span>
                </header>
                <div className="application-board-stack">
                  {columnApplications.map((application) => (
                    <article
                      className="application-board-card"
                      draggable={updatingApplicationId !== application.id}
                      key={application.id}
                      onDragStart={() => setDraggedApplicationId(application.id)}
                      onDragEnd={() => setDraggedApplicationId(null)}
                    >
                      <Link to={`/applications/${application.id}`}>
                        <strong>{application.company}</strong>
                        <span>{application.roleTitle}</span>
                        <small>
                          {application.location || "Location not recorded"}
                          {application.closingDate && ` · Closes ${application.closingDate}`}
                        </small>
                      </Link>
                      <label>
                        <span className="visually-hidden">Move {application.company} to</span>
                        <select
                          value={application.status}
                          disabled={updatingApplicationId === application.id}
                          onChange={(event) => void moveApplication(
                            application.id,
                            event.target.value as ApplicationStatus,
                          )}
                        >
                          {APPLICATION_STATUSES.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
                  {columnApplications.length === 0 && (
                    <p className="application-board-empty">Drop an application here</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Recruiter Screen",
  "First Interview",
  "Technical Interview",
  "Second Interview",
  "Reference Check",
  "Offer",
  "Rejected",
  "Withdrawn",
];

function localDateTimeValue() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 19);
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

function isApplicationStatus(
  value: string | null,
): value is ApplicationStatus {
  return [
    "Saved",
    "Applied",
    "Recruiter Screen",
    "First Interview",
    "Second Interview",
    "Technical Interview",
    "Reference Check",
    "Offer",
    "Rejected",
    "Withdrawn",
  ].includes(value ?? "");
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
