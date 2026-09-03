import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import StatusBadge from "../components/StatusBadge";
import ApplicationTimeline from "../components/ApplicationTimeline";
import ResourceNotFoundState from "../components/ResourceNotFoundState";
import type { Application } from "../types/application";
import type { ResumeReview } from "../types/resumeReview";
import type { EvidenceItem } from "../types/evidenceItem";
import {
  deleteApplication,
  getApplicationById,
  getResumeReviews,
  getEvidenceItems,
  updateApplicationDecision,
  updateApplicationEvidence,
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
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<number[]>([]);
  const [decision, setDecision] = useState<"Pursue" | "Maybe" | "Skip">("Pursue");
  const [decisionReason, setDecisionReason] = useState("");
  const [strongestFit, setStrongestFit] = useState("");
  const [mainConcern, setMainConcern] = useState("");
  const [packMessage, setPackMessage] = useState("");
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [isSavingEvidence, setIsSavingEvidence] = useState(false);

  useEffect(() => {
    async function fetchApplication() {
      if (!id) {
        setErrorMessage("Application ID is missing.");
        return;
      }

      try {
        const data = await getApplicationById(id);
        setApplication(data);
        setDecision(data.decision || "Pursue");
        setDecisionReason(data.decisionReason || "");
        setStrongestFit(data.strongestFit || "");
        setMainConcern(data.mainConcern || "");
        setSelectedEvidenceIds(data.evidenceItemIds || []);
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

  useEffect(() => {
    getEvidenceItems()
      .then(setEvidenceItems)
      .catch(() => setPackMessage("Evidence Bank could not be loaded."));
  }, []);

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

  async function handleDecisionSave(event: React.FormEvent) {
    event.preventDefault();
    if (!application) return;
    setIsSavingDecision(true);
    setPackMessage("");
    try {
      setApplication(await updateApplicationDecision(application.id, {
        decision,
        decisionReason,
        strongestFit,
        mainConcern,
      }));
      setPackMessage("Decision saved to this application pack.");
    } catch {
      setPackMessage("The decision could not be saved.");
    } finally {
      setIsSavingDecision(false);
    }
  }

  async function handleEvidenceSave() {
    if (!application) return;
    setIsSavingEvidence(true);
    setPackMessage("");
    try {
      setApplication(
        await updateApplicationEvidence(application.id, selectedEvidenceIds),
      );
      setPackMessage("Evidence selection saved.");
    } catch {
      setPackMessage("The evidence selection could not be saved.");
    } finally {
      setIsSavingEvidence(false);
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

      <section className="detail-section application-pack">
        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Application pack</p>
            <h2>Keep every decision and preparation asset together</h2>
            <p className="muted">
              Record why this role is worth your time, then attach reusable
              evidence before tailoring your CV and interview answers.
            </p>

            <div className="pack-summary">
              <span><strong>Decision</strong>{application.decision || "Not decided"}</span>
              <span><strong>Evidence</strong>{application.evidenceItemIds.length} selected</span>
              <span><strong>CV reviews</strong>{relatedReviews.length} saved</span>
              <span><strong>Timeline</strong>{application.status}</span>
            </div>

            {packMessage && <p className="muted" role="status">{packMessage}</p>}

            <div className="grid two pack-editors">
              <form onSubmit={handleDecisionSave}>
                <h3>1. Decide whether to pursue</h3>
                <label>
                  Decision
                  <select
                    value={decision}
                    onChange={(event) => setDecision(event.target.value as typeof decision)}
                    disabled={application.archived}
                  >
                    <option value="Pursue">Pursue</option>
                    <option value="Maybe">Maybe</option>
                    <option value="Skip">Skip</option>
                  </select>
                </label>
                <label>
                  Why this decision?
                  <textarea value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} maxLength={2000} />
                </label>
                <label>
                  Strongest fit
                  <textarea value={strongestFit} onChange={(event) => setStrongestFit(event.target.value)} maxLength={2000} />
                </label>
                <label>
                  Main concern or gap
                  <textarea value={mainConcern} onChange={(event) => setMainConcern(event.target.value)} maxLength={2000} />
                </label>
                <button className="button primary" disabled={application.archived || isSavingDecision}>
                  {isSavingDecision ? "Saving..." : "Save decision"}
                </button>
              </form>

              <div>
                <h3>2. Select evidence for this role</h3>
                <p className="muted">Choose achievements that prove the JD requirements.</p>
                {evidenceItems.length === 0 ? (
                  <p className="muted">No evidence yet. <Link to="/profile">Add evidence in your profile</Link>.</p>
                ) : (
                  <div className="evidence-picker">
                    {evidenceItems.map((item) => (
                      <label className="evidence-choice" key={item.id}>
                        <input
                          type="checkbox"
                          checked={selectedEvidenceIds.includes(item.id)}
                          disabled={application.archived}
                          onChange={() => setSelectedEvidenceIds((current) =>
                            current.includes(item.id)
                              ? current.filter((id) => id !== item.id)
                              : [...current, item.id]
                          )}
                        />
                        <span><strong>{item.title}</strong><small>{item.skills || item.result}</small></span>
                      </label>
                    ))}
                  </div>
                )}
                <button
                  className="button"
                  type="button"
                  disabled={application.archived || isSavingEvidence || evidenceItems.length === 0}
                  onClick={handleEvidenceSave}
                >
                  {isSavingEvidence ? "Saving..." : "Save selected evidence"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
