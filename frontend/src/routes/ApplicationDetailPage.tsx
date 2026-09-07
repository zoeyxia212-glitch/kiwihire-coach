import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import StatusBadge from "../components/StatusBadge";
import ApplicationTimeline from "../components/ApplicationTimeline";
import FollowUpTemplateBuilder from "../components/FollowUpTemplateBuilder";
import ResourceNotFoundState from "../components/ResourceNotFoundState";
import type { Application } from "../types/application";
import type { ResumeReview } from "../types/resumeReview";
import type { EvidenceItem } from "../types/evidenceItem";
import type { ApplicationAnswer } from "../types/applicationAnswer";
import {
  deleteApplication,
  createApplication,
  getApplicationById,
  getResumeReviews,
  getEvidenceItems,
  updateApplicationDecision,
  updateApplicationEvidence,
  updateApplicationAnswers,
  getApplicationAnswers,
  createSubmissionSnapshot,
  updateApplicationArchived,
  ResourceNotFoundError,
} from "../utils/api";
import { downloadSubmissionRecord } from "../utils/submissionRecord";

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
  const [answerItems, setAnswerItems] = useState<ApplicationAnswer[]>([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<number[]>([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<number[]>([]);
  const [decision, setDecision] = useState<"Pursue" | "Maybe" | "Skip">("Pursue");
  const [decisionReason, setDecisionReason] = useState("");
  const [strongestFit, setStrongestFit] = useState("");
  const [mainConcern, setMainConcern] = useState("");
  const [packMessage, setPackMessage] = useState("");
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [isSavingEvidence, setIsSavingEvidence] = useState(false);
  const [isSavingAnswers, setIsSavingAnswers] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

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
        setSelectedAnswerIds(data.applicationAnswerIds || []);
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
          ).sort(
            (left, right) =>
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime(),
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
    Promise.all([getEvidenceItems(), getApplicationAnswers()])
      .then(([evidence, answers]) => {
        setEvidenceItems(evidence);
        setAnswerItems(answers);
      })
      .catch(() => setPackMessage("Application Pack resources could not be loaded."));
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

  async function handleDuplicate() {
    if (!application) return;

    setIsDuplicating(true);
    setErrorMessage("");
    try {
      const duplicate = await createApplication({
        company: application.company,
        roleTitle: application.roleTitle,
        location: application.location || "",
        status: "Saved",
        jobDescription: application.jobDescription,
        closingDate: application.closingDate || "",
        source: application.source || "",
        workMode: application.workMode || "",
        workRightsRequirement: application.workRightsRequirement || "",
        salaryRange: application.salaryRange || "",
        contactPerson: application.contactPerson || "",
        jobUrl: application.jobUrl || "",
        careerLevel: application.careerLevel || "",
        employmentType: application.employmentType || "",
        graduateFriendly: application.graduateFriendly,
        sponsorshipAvailable: application.sponsorshipAvailable,
        industry: application.industry || "",
      });
      window.location.href = `/applications/${duplicate.id}/edit?duplicated=true`;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to duplicate application.",
      );
      setIsDuplicating(false);
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

  async function handleAnswersSave() {
    if (!application) return;
    setIsSavingAnswers(true);
    setPackMessage("");
    try {
      setApplication(
        await updateApplicationAnswers(application.id, selectedAnswerIds),
      );
      setPackMessage("Application answers saved to this role.");
    } catch {
      setPackMessage("The application answers could not be saved.");
    } finally {
      setIsSavingAnswers(false);
    }
  }

  async function handleCreateSnapshot() {
    if (!application) return;
    const confirmed = window.confirm(
      "Confirm that you submitted this application? KiwiHire will freeze the current job description, latest reviewed CV, and selected answers.",
    );
    if (!confirmed) return;
    setIsCreatingSnapshot(true);
    setPackMessage("");
    try {
      setApplication(await createSubmissionSnapshot(application.id));
      setPackMessage("Submission snapshot created. The submitted materials are now frozen.");
    } catch (error) {
      setPackMessage(
        error instanceof Error ? error.message : "The submission snapshot could not be created.",
      );
    } finally {
      setIsCreatingSnapshot(false);
    }
  }
  if (!application) {
    return <p className="muted">Loading application...</p>;
  }

  const latestReview = relatedReviews[0];
  const fitRecommendation = latestReview
    ? buildFitRecommendation(latestReview)
    : null;
  const rankedEvidenceItems = evidenceItems
    .map((item) => ({
      item,
      matchedSkills: matchEvidenceSkills(item, application),
    }))
    .sort((left, right) =>
      right.matchedSkills.length - left.matchedSkills.length
      || Number(selectedEvidenceIds.includes(right.item.id))
        - Number(selectedEvidenceIds.includes(left.item.id))
      || left.item.title.localeCompare(right.item.title),
    );
  const recommendedEvidenceIds = rankedEvidenceItems
    .filter(({ matchedSkills }) => matchedSkills.length > 0)
    .slice(0, 3)
    .map(({ item }) => item.id);
  const rankedAnswerItems = answerItems
    .map((item) => ({
      item,
      matchedTerms: matchAnswerTerms(item, application),
    }))
    .sort((left, right) =>
      right.matchedTerms.length - left.matchedTerms.length
      || Number(selectedAnswerIds.includes(right.item.id))
        - Number(selectedAnswerIds.includes(left.item.id))
      || left.item.question.localeCompare(right.item.question),
    );
  const recommendedAnswerIds = rankedAnswerItems
    .filter(({ matchedTerms }) => matchedTerms.length > 0)
    .slice(0, 3)
    .map(({ item }) => item.id);
  const readyAnswerCount = relatedReviews.reduce(
    (total, review) =>
      total + review.answerStatuses.filter((status) => status === "Ready").length,
    0,
  );
  const readinessSteps = [
    {
      title: "Role captured",
      description: "Save the job description and core role details.",
      complete: Boolean(application.jobDescription.trim()),
      action: "Edit role",
      to: `/applications/${application.id}/edit`,
    },
    {
      title: "Pursuit decision",
      description: "Record why this role is, or is not, worth your time.",
      complete: Boolean(application.decision && application.decisionReason?.trim()),
      action: "Complete below",
      to: "#application-decision",
    },
    {
      title: "Evidence selected",
      description: "Attach achievements that prove the job requirements.",
      complete: application.evidenceItemIds.length > 0,
      action: "Select below",
      to: "#application-evidence",
    },
    {
      title: "CV reviewed",
      description: "Compare a saved CV against this specific role.",
      complete: relatedReviews.length > 0,
      action: "Review CV",
      to: `/review?application=${application.id}`,
    },
    {
      title: "Answers prepared",
      description: "Attach a reusable application answer or prepare an interview answer.",
      complete: application.applicationAnswerIds.length > 0 || readyAnswerCount > 0,
      action: "Select answers",
      to: "#application-answers",
    },
    {
      title: "Application submitted",
      description: "Update the stage after you actually send the application.",
      complete: Boolean(application.submittedAt),
      action: "Confirm submission",
      to: "#submission-snapshot",
    },
  ];
  const completedReadinessSteps = readinessSteps.filter(
    (step) => step.complete,
  ).length;
  const readinessPercent = Math.round(
    (completedReadinessSteps / readinessSteps.length) * 100,
  );

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
              <button
                className="button"
                type="button"
                disabled={isDuplicating}
                onClick={handleDuplicate}
              >
                {isDuplicating ? "Creating copy..." : "Duplicate application"}
              </button>
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

      <section className="detail-section readiness-panel">
        <div className="panel">
          <div className="panel-inner">
            <div className="readiness-heading">
              <div>
                <p className="eyebrow">Application readiness</p>
                <h2>Know exactly what to do next</h2>
                <p className="muted">
                  Complete the role-specific preparation before marking the
                  application as submitted.
                </p>
              </div>
              <div className="readiness-score" aria-label={`${readinessPercent}% ready`}>
                <strong>{readinessPercent}%</strong>
                <span>{completedReadinessSteps}/{readinessSteps.length} complete</span>
              </div>
            </div>
            <progress
              className="readiness-progress"
              max={readinessSteps.length}
              value={completedReadinessSteps}
            />
            <ol className="readiness-list">
              {readinessSteps.map((step, index) => (
                <li className={step.complete ? "is-complete" : ""} key={step.title}>
                  <span className="readiness-marker" aria-hidden="true">
                    {step.complete ? "✓" : index + 1}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </div>
                  <Link className="button compact" to={step.to}>
                    {step.complete ? "Review" : step.action}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

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
              <span><strong>Answers</strong>{application.applicationAnswerIds.length} selected</span>
              <span><strong>CV reviews</strong>{relatedReviews.length} saved</span>
              <span><strong>Timeline</strong>{application.status}</span>
            </div>

            {packMessage && <p className="muted" role="status">{packMessage}</p>}

            <div className="grid two pack-editors">
              <form id="application-decision" onSubmit={handleDecisionSave}>
                <h3>1. Decide whether to pursue</h3>
                {fitRecommendation ? (
                  <div className={`fit-recommendation recommendation-${fitRecommendation.decision.toLowerCase()}`}>
                    <div className="fit-recommendation-heading">
                      <div>
                        <span>
                          Latest CV review · {latestReview.score === null
                            ? "Not scored"
                            : `${latestReview.score}% match`}
                        </span>
                        <strong>Suggested decision: {fitRecommendation.decision}</strong>
                      </div>
                      <button
                        className="button compact"
                        type="button"
                        disabled={application.archived}
                        onClick={() => {
                          setDecision(fitRecommendation.decision);
                          setDecisionReason(fitRecommendation.reason);
                          setStrongestFit(fitRecommendation.strongestFit);
                          setMainConcern(fitRecommendation.mainConcern);
                        }}
                      >
                        Use suggestion
                      </button>
                    </div>
                    <p>{fitRecommendation.explanation}</p>
                    <small>
                      This suggestion only measures supported skills. Check work
                      rights, location, salary and other hard requirements yourself.
                    </small>
                  </div>
                ) : (
                  <div className="fit-recommendation recommendation-empty">
                    <strong>No role-specific match evidence yet</strong>
                    <p>
                      Run a CV review first. KiwiHire will then explain whether this
                      role looks strong, borderline or low-fit.
                    </p>
                    <Link className="button compact" to={`/review?application=${application.id}`}>
                      Review CV
                    </Link>
                  </div>
                )}
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

              <div id="application-evidence">
                <div className="pack-subsection-heading">
                  <div>
                    <h3>2. Select evidence for this role</h3>
                    <span className="muted">
                      {selectedEvidenceIds.length} selected · {recommendedEvidenceIds.length} recommended
                    </span>
                  </div>
                  {recommendedEvidenceIds.length > 0 && (
                    <button
                      className="button compact"
                      type="button"
                      disabled={application.archived}
                      onClick={() =>
                        setSelectedEvidenceIds((currentIds) => [
                          ...new Set([...currentIds, ...recommendedEvidenceIds]),
                        ])
                      }
                    >
                      Add recommended evidence
                    </button>
                  )}
                </div>
                <p className="muted">
                  Choose achievements that prove the JD requirements. Items are
                  ranked by skill words found in this role; check the evidence
                  quality yourself before using it.
                </p>
                {evidenceItems.length === 0 ? (
                  <p className="muted">No evidence yet. <Link to="/profile">Add evidence in your profile</Link>.</p>
                ) : (
                  <div className="evidence-picker">
                    {rankedEvidenceItems.map(({ item, matchedSkills }) => (
                      <label
                        className={
                          matchedSkills.length
                            ? "evidence-choice evidence-choice-matched"
                            : "evidence-choice"
                        }
                        key={item.id}
                      >
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
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.skills || item.result}</small>
                          {matchedSkills.length > 0 && (
                            <small className="evidence-match-reason">
                              JD match: {matchedSkills.join(", ")}
                            </small>
                          )}
                        </span>
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

            <div className="pack-answer-picker" id="application-answers">
              <div className="pack-answer-heading">
                <div>
                  <h3>3. Select reusable application answers</h3>
                  <p className="muted">
                    Add useful starting points to this role, then adapt company-specific
                    wording before submitting.
                  </p>
                </div>
                <div className="pack-answer-actions">
                  {recommendedAnswerIds.length > 0 && (
                    <button
                      className="button compact"
                      type="button"
                      disabled={application.archived}
                      onClick={() =>
                        setSelectedAnswerIds((currentIds) => [
                          ...new Set([...currentIds, ...recommendedAnswerIds]),
                        ])
                      }
                    >
                      Add recommended answers
                    </button>
                  )}
                  <Link className="button compact" to="/answers">
                    Manage answer library
                  </Link>
                </div>
              </div>
              {answerItems.length === 0 ? (
                <p className="muted">
                  No saved answers yet. <Link to="/answers">Create your first answer</Link>.
                </p>
              ) : (
                <div className="application-answer-picker-list">
                  {rankedAnswerItems.map(({ item, matchedTerms }) => (
                    <label
                      className={
                        matchedTerms.length
                          ? "application-answer-choice application-answer-choice-matched"
                          : "application-answer-choice"
                      }
                      key={item.id}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAnswerIds.includes(item.id)}
                        disabled={application.archived}
                        onChange={() => setSelectedAnswerIds((current) =>
                          current.includes(item.id)
                            ? current.filter((answerId) => answerId !== item.id)
                            : [...current, item.id]
                        )}
                      />
                      <span>
                        <strong>{item.question}</strong>
                        <small>{item.answer}</small>
                        {matchedTerms.length > 0 && (
                          <small className="evidence-match-reason">
                            Role/JD match: {matchedTerms.join(", ")}
                          </small>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <button
                className="button"
                type="button"
                disabled={application.archived || isSavingAnswers || answerItems.length === 0}
                onClick={handleAnswersSave}
              >
                {isSavingAnswers ? "Saving..." : "Save selected answers"}
              </button>
            </div>

            <div className="submission-snapshot" id="submission-snapshot">
              <div>
                <p className="eyebrow">Submitted version</p>
                <h3>
                  {application.submittedAt
                    ? "Your submitted materials are frozen"
                    : "Freeze the version the employer receives"}
                </h3>
                <p className="muted">
                  {application.submittedAt
                    ? `Submitted ${formatDateTime(application.submittedAt)} using ${application.submittedResumeName}.`
                    : "Do this only after sending the application. You need at least one saved CV review."}
                </p>
              </div>
              {application.submittedAt ? (
                <div className="snapshot-actions">
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => downloadSubmissionRecord(application)}
                  >
                    Download submission record
                  </button>
                  <details>
                    <summary>View submitted snapshot</summary>
                    <div className="snapshot-content">
                      <h4>Job description</h4>
                      <pre>{application.submittedJobDescription}</pre>
                      <h4>CV · {application.submittedResumeName}</h4>
                      <pre>{application.submittedResumeContent}</pre>
                      <h4>Application answers</h4>
                      <pre>{application.submittedAnswers || "No application answers were attached."}</pre>
                      <h4>Selected evidence</h4>
                      <pre>{application.submittedEvidence || "No evidence items were attached."}</pre>
                    </div>
                  </details>
                </div>
              ) : (
                <button
                  className="button primary"
                  type="button"
                  disabled={application.archived || isCreatingSnapshot || !latestReview}
                  onClick={handleCreateSnapshot}
                >
                  {isCreatingSnapshot ? "Creating snapshot..." : "Mark as submitted"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <FollowUpTemplateBuilder
        company={application.company}
        roleTitle={application.roleTitle}
        contactPerson={application.contactPerson}
        userEmail={application.userEmail}
      />

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
        <div id="application-timeline">
          <ApplicationTimeline
            key={application.submittedAt ?? "not-submitted"}
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
        </div>
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

function matchEvidenceSkills(
  evidence: EvidenceItem,
  application: Application,
) {
  const roleText = `${application.roleTitle} ${application.jobDescription}`
    .toLowerCase()
    .replace(/\s+/g, " ");
  const skills = evidence.skills
    .split(/[,;\n]/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length >= 2);

  return [...new Set(skills)].filter((skill) => {
    const normalizedSkill = skill.toLowerCase().replace(/\s+/g, " ");
    const singularSkill = normalizedSkill.endsWith("s")
      ? normalizedSkill.slice(0, -1)
      : normalizedSkill;
    return roleText.includes(normalizedSkill)
      || roleText.includes(singularSkill);
  });
}

function matchAnswerTerms(
  answer: ApplicationAnswer,
  application: Application,
) {
  const roleText = `${application.roleTitle} ${application.jobDescription}`
    .toLowerCase()
    .replace(/\s+/g, " ");
  const terms = `${answer.tags},${answer.roleTypes}`
    .split(/[,;\n]/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
  const uniqueTerms = terms.filter(
    (term, index) =>
      terms.findIndex(
        (candidate) => candidate.toLowerCase() === term.toLowerCase(),
      ) === index,
  );

  return uniqueTerms.filter((term) => {
    const normalizedTerm = term.toLowerCase().replace(/\s+/g, " ");
    const singularTerm = normalizedTerm.endsWith("s")
      ? normalizedTerm.slice(0, -1)
      : normalizedTerm;
    return roleText.includes(normalizedTerm)
      || roleText.includes(singularTerm);
  });
}

function buildFitRecommendation(review: ResumeReview) {
  const score = review.score;
  const decision: "Pursue" | "Maybe" | "Skip" =
    score === null ? "Maybe" : score >= 75 ? "Pursue" : score >= 50 ? "Maybe" : "Skip";
  const matchedSkills = review.matched.map((item) => item.skill);
  const transferableSkills = review.transferable.map((item) => item.skill);
  const missingSkills = review.missing.map((item) => item.skill);
  const supportedSkills = [...matchedSkills, ...transferableSkills];

  const strongestFit = supportedSkills.length
    ? `Supported skills: ${supportedSkills.slice(0, 5).join(", ")}.`
    : "No supported skills were detected in the latest CV review.";
  const mainConcern = missingSkills.length
    ? `Missing or unproven skills: ${missingSkills.slice(0, 5).join(", ")}.`
    : "No missing supported skill terms were detected; review the full responsibilities manually.";
  const explanation =
    decision === "Pursue"
      ? "Your latest review shows strong supported skill coverage. The role appears worth deeper preparation if the hard requirements also fit."
      : decision === "Maybe"
        ? "The match is mixed or could not be scored confidently. Review the gaps and hard requirements before investing more time."
        : "The latest review found limited supported skill coverage. Apply only if important transferable evidence was missed or the role remains strategically valuable.";

  return {
    decision,
    explanation,
    strongestFit,
    mainConcern,
    reason: `${explanation} ${strongestFit} ${mainConcern}`,
  };
}
