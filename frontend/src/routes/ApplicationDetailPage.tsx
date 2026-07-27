import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import StatusBadge from "../components/StatusBadge";
import ApplicationTimeline from "../components/ApplicationTimeline";
import ResourceNotFoundState from "../components/ResourceNotFoundState";
import type { Application } from "../types/application";
import {
  deleteApplication,
  getApplicationById,
  updateApplicationArchived,
  ResourceNotFoundError,
} from "../utils/api";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isUpdatingArchive, setIsUpdatingArchive] =
    useState(false);

  useEffect(() => {
    async function fetchApplication() {
      if (!id) {
        setErrorMessage("Application ID is missing.");
        return;
      }

      try {
        const data = await getApplicationById(id);
        setApplication(data);
      } catch (error) {
        if (error instanceof ResourceNotFoundError) {
          setIsNotFound(true);
        } else {
          setErrorMessage("Failed to load application.");
        }
      }
    }

    fetchApplication();
  }, [id]);

  if (isNotFound) {
    return (
      <ResourceNotFoundState
        title="This application could not be found."
        message="It may have been deleted, or it may belong to another account."
        backTo="/applications"
        backLabel="Back to applications"
      />
    );
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }
  async function handleDelete() {
    if (!id) {
      setErrorMessage("Application ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this application?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteApplication(id);
      window.location.href = "/applications";
    } catch {
      setErrorMessage("Failed to delete application.");
    }
  }

  async function handleArchive() {
    if (!application) {
      return;
    }

    setIsUpdatingArchive(true);
    setErrorMessage("");

    try {
      setApplication(
        await updateApplicationArchived(
          application.id,
          !application.archived,
        ),
      );
    } catch {
      setErrorMessage("Failed to update the application archive.");
    } finally {
      setIsUpdatingArchive(false);
    }
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
        <div>
          <StatusBadge status={application.status} />
          {!application.archived && (
            <>
              <Link
                className="button"
                to={`/applications/${application.id}/edit`}
              >
                Edit application
              </Link>
              <Link
                className="button primary"
                to={`/review?application=${application.id}`}
              >
                Review resume for this role
              </Link>
            </>
          )}
          <button
            className="button"
            type="button"
            disabled={isUpdatingArchive}
            onClick={handleArchive}
          >
            {isUpdatingArchive
              ? "Saving..."
              : application.archived
                ? "Restore application"
                : "Archive application"}
          </button>
          <button
            className="button"
            type="button"
            onClick={handleDelete}
          >
            Delete application
          </button>
          {application.jobUrl && (
            <a
              className="button"
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open job listing
            </a>
          )}
        </div>
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
            <p className="muted">
              Record: {application.archived ? "Archived" : "Active"}
            </p>
            <p className="muted">
              Created: {formatDateTime(application.createdAt)}
            </p>
            <p className="muted">
              Source: {application.source || "Not recorded"}
            </p>
            <p className="muted">
              Work mode: {application.workMode || "Not specified"}
            </p>
            <p className="muted">
              Work rights:{" "}
              {application.workRightsRequirement || "Not specified"}
            </p>
            <p className="muted">
              Salary: {application.salaryRange || "Not recorded"}
            </p>
            <p className="muted">
              Contact: {application.contactPerson || "Not recorded"}
            </p>
            <p className="muted">
              Job URL:{" "}
              {application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open original listing
                </a>
              ) : (
                "Not recorded"
              )}
            </p>
          </div>
        </div>
      </div>

      {application.archived ? (
        <div className="panel">
          <div className="panel-inner">
            <h2>This application is archived</h2>
            <p className="muted">
              Restore it to edit the application, add timeline events,
              or run a new resume review.
            </p>
          </div>
        </div>
      ) : (
        <ApplicationTimeline
          applicationId={id!}
          onStageChange={(stage) =>
            setApplication((currentApplication) =>
              currentApplication
                ? {
                    ...currentApplication,
                    status: stage as Application["status"],
                  }
                : currentApplication
            )
          }
        />
      )}
    </section>
  );
}
