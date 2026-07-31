import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import StatusBadge from "../components/StatusBadge";
import ApplicationTimeline from "../components/ApplicationTimeline";
import ResourceNotFoundState from "../components/ResourceNotFoundState";
import type { Application } from "../types/application";
import type { ResumeReview } from "../types/resumeReview";
import {
  deleteApplication,
  getApplicationById,
  getResumeReviews,
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
  const [relatedReviews, setRelatedReviews] = useState<ResumeReview[]>(
    [],
  );
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState("");
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

  useEffect(() => {
    async function fetchRelatedReviews() {
      if (!id) {
        setIsLoadingReviews(false);
        return;
      }

      try {
        const reviews = await getResumeReviews();
        setRelatedReviews(
          reviews.filter(
            (review) => review.applicationId === Number(id),
          ),
        );
      } catch {
        setReviewError("Related reviews could not be loaded.");
      } finally {
        setIsLoadingReviews(false);
      }
    }

    fetchRelatedReviews();
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
              Career level: {application.careerLevel || "Not specified"}
            </p>
            <p className="muted">
              Employment type:{" "}
              {application.employmentType || "Not specified"}
            </p>
            <p className="muted">
              Graduate friendly:{" "}
              {formatOptionalBoolean(application.graduateFriendly)}
            </p>
            <p className="muted">
              Visa sponsorship:{" "}
              {formatOptionalBoolean(application.sponsorshipAvailable)}
            </p>
            <p className="muted">
              Industry: {application.industry || "Not recorded"}
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

      <section className="detail-section">
        <div className="panel">
          <div className="panel-inner">
            <div className="page-header">
              <div>
                <p className="eyebrow">Preparation history</p>
                <h2>Reviews for this application</h2>
                <p className="muted">
                  Compare resume versions and return to saved interview
                  preparation.
                </p>
              </div>
              {!application.archived && (
                <Link
                  className="button primary"
                  to={`/review?application=${application.id}`}
                >
                  Run another review
                </Link>
              )}
            </div>

            {isLoadingReviews && (
              <p className="muted">Loading related reviews...</p>
            )}
            {reviewError && (
              <p className="error-message" role="alert">
                {reviewError}
              </p>
            )}
            {!isLoadingReviews &&
              !reviewError &&
              relatedReviews.length === 0 && (
                <p className="muted">
                  No saved reviews for this application yet.
                </p>
              )}
            <div className="list">
              {relatedReviews.map((review) => {
                const readyAnswers = review.answerStatuses.filter(
                  (status) => status === "Ready",
                ).length;

                return (
                  <article className="list-row" key={review.id}>
                    <div>
                      <h3>{review.resumeName}</h3>
                      <p>
                        {review.score === null
                          ? "No match score"
                          : `${review.score}% match`}
                        {" · "}
                        {readyAnswers}/{review.questions.length} interview
                        answers ready
                      </p>
                      <p className="muted">
                        Saved {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                    <Link
                      className="button compact"
                      to={`/reviews/${review.id}`}
                    >
                      Open review
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

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

function formatOptionalBoolean(value: boolean | null) {
  if (value === null) {
    return "Unknown";
  }

  return value ? "Yes" : "No";
}
