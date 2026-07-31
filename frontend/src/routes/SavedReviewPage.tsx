import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ReviewResultDisplay from "../components/ReviewResultDisplay";
import ResourceNotFoundState from "../components/ResourceNotFoundState";
import type { CandidateProfile } from "../types/candidateProfile";
import type {
  InterviewAnswerStatus,
  ResumeReview,
  SuggestionStatus,
  WorkflowIntent,
} from "../types/resumeReview";
import {
  createLearningGoal,
  deleteResumeReview,
  getApplicationById,
  getCandidateProfile,
  getResumeReviewById,
  updateResumeReviewAnswers,
  updateResumeReviewAnswerStatus,
  updateResumeReviewFeedback,
  updateResumeReviewSuggestionStatus,
  ResourceNotFoundError,
} from "../utils/api";

export default function SavedReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [workflowIntent, setWorkflowIntent] =
    useState<WorkflowIntent>(null);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    async function loadReview() {
      setIsLoading(true);
      setReview(null);
      setError("");
      setIsNotFound(false);

      if (!id) {
        setError("Review not found.");
        setIsLoading(false);
        return;
      }

      try {
        const loadedReview = await getResumeReviewById(id);
        const [loadedProfile, loadedApplication] = await Promise.all([
          getCandidateProfile(),
          getApplicationById(String(loadedReview.applicationId)),
        ]);
        setReview(loadedReview);
        setCandidateProfile(loadedProfile);
        setJobDescription(loadedApplication.jobDescription);
        setFeedbackComment(loadedReview.feedbackComment ?? "");
        setWorkflowIntent(loadedReview.workflowIntent);
      } catch (error) {
        if (error instanceof ResourceNotFoundError) {
          setIsNotFound(true);
        } else {
          setError("This saved review could not be loaded.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadReview();
  }, [id]);

  async function handleDelete() {
    if (!review) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this saved review? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteResumeReview(review.id);
      navigate("/review", { replace: true });
    } catch {
      setError("This saved review could not be deleted.");
      setIsDeleting(false);
    }
  }

  async function handleFeedback(helpful: boolean) {
    if (!review) {
      return;
    }

    setIsSavingFeedback(true);
    setError("");

    try {
      setReview(
        await updateResumeReviewFeedback(
          review.id,
          helpful,
          feedbackComment,
          workflowIntent,
        ),
      );
    } catch {
      setError("Your feedback could not be saved.");
    } finally {
      setIsSavingFeedback(false);
    }
  }

  async function saveDetailedFeedback() {
    if (!review || review.helpful === null) {
      return;
    }

    setIsSavingFeedback(true);
    setError("");

    try {
      const savedReview = await updateResumeReviewFeedback(
        review.id,
        review.helpful,
        feedbackComment,
        workflowIntent,
      );
      setReview(savedReview);
      setFeedbackComment(savedReview.feedbackComment ?? "");
      setWorkflowIntent(savedReview.workflowIntent);
    } catch {
      setError("Your feedback could not be saved.");
    } finally {
      setIsSavingFeedback(false);
    }
  }

  async function handleSaveAnswer(
    questionIndex: number,
    answer: string,
  ) {
    if (!review) {
      return;
    }

    const answers = Array.from(
      { length: review.questions.length },
      (_, index) => review.answers[index] ?? "",
    );
    answers[questionIndex] = answer;

    setReview(
      await updateResumeReviewAnswers(review.id, answers),
    );
  }

  async function handleUpdateAnswerStatus(
    questionIndex: number,
    status: InterviewAnswerStatus,
  ) {
    if (!review) {
      return;
    }

    setReview(
      await updateResumeReviewAnswerStatus(
        review.id,
        questionIndex,
        status,
      ),
    );
  }

  async function handleUpdateSuggestionStatus(
    suggestionIndex: number,
    status: SuggestionStatus,
  ) {
    if (!review) {
      return;
    }

    setError("");

    try {
      setReview(
        await updateResumeReviewSuggestionStatus(
          review.id,
          suggestionIndex,
          status,
        ),
      );
    } catch {
      setError("The resume action decision could not be saved.");
    }
  }

  async function addLearningPriority(
    skill: string,
    reason: string,
  ) {
    if (!review) {
      return;
    }

    setError("");

    try {
      await createLearningGoal({
        skill,
        reason,
        sourceReviewId: review.id,
      });
      setAddedSkills((currentSkills) => [
        ...new Set([...currentSkills, skill]),
      ]);
    } catch {
      setError("The learning priority could not be added.");
    }
  }

  if (isLoading) {
    return <p className="muted">Loading saved review...</p>;
  }

  if (isNotFound) {
    return (
      <ResourceNotFoundState
        title="This saved review could not be found."
        message="It may have been deleted, or it may belong to another account."
        backTo="/review"
        backLabel="Back to review history"
      />
    );
  }

  if (!review) {
    return (
      <section className="page">
        <p className="error-message" role="alert">
          {error || "Review not found."}
        </p>
        <Link to="/review">Back to resume review</Link>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Saved review</p>
          <h1>
            {review.company} · {review.roleTitle}
          </h1>
          <p className="muted">
            Resume: {review.resumeName} · Saved{" "}
            {formatReviewDate(review.createdAt)}
          </p>
        </div>
        <div className="form-actions no-print">
          <button
            className="button primary"
            type="button"
            onClick={() => window.print()}
          >
            Print or save as PDF
          </button>
          <Link
            className="button"
            to={`/applications/${review.applicationId}`}
          >
            View application
          </Link>
          <Link
            className="button"
            to={`/resumes?edit=${review.resumeId}`}
          >
            Edit resume
          </Link>
          <Link className="button secondary" to="/review">
            Back to review workspace
          </Link>
          <button
            className="button"
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete review"}
          </button>
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <div className="panel review-feedback">
        <div className="panel-inner">
          <p className="eyebrow">Improve future reviews</p>
          <h2>Was this analysis useful?</h2>
          <p className="muted">
            Your answer helps identify which local matching rules are
            genuinely useful to candidates.
          </p>
          <div className="form-actions">
            <button
              className={`button ${review.helpful === true ? "primary" : ""}`}
              type="button"
              disabled={isSavingFeedback}
              aria-pressed={review.helpful === true}
              onClick={() => handleFeedback(true)}
            >
              Helpful
            </button>
            <button
              className={`button ${review.helpful === false ? "selected-negative" : ""}`}
              type="button"
              disabled={isSavingFeedback}
              aria-pressed={review.helpful === false}
              onClick={() => handleFeedback(false)}
            >
              Not helpful
            </button>
            {review.helpful !== null && (
              <span className="success-message" role="status">
                Feedback saved
              </span>
            )}
          </div>

          <div className="review-feedback-details">
            <fieldset>
              <legend>
                Would you use this workflow for a real application?
              </legend>
              <div className="form-actions">
                {(["Yes", "Maybe", "No"] as const).map((option) => (
                  <button
                    className={`button compact ${workflowIntent === option ? "primary" : ""}`}
                    type="button"
                    aria-pressed={workflowIntent === option}
                    key={option}
                    onClick={() => setWorkflowIntent(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="field">
              <label htmlFor="review-feedback-comment">
                What was unclear, missing, or especially useful?
              </label>
              <textarea
                id="review-feedback-comment"
                value={feedbackComment}
                maxLength={2000}
                placeholder="Optional feedback about this review..."
                onChange={(event) =>
                  setFeedbackComment(event.target.value)
                }
              />
              <span className="field-help">
                {feedbackComment.length.toLocaleString()} / 2,000
              </span>
            </div>
            <button
              className="button primary"
              type="button"
              disabled={isSavingFeedback || review.helpful === null}
              onClick={saveDetailedFeedback}
            >
              {isSavingFeedback
                ? "Saving feedback..."
                : "Save detailed feedback"}
            </button>
            {review.helpful === null && (
              <p className="muted">
                Choose Helpful or Not helpful before saving details.
              </p>
            )}
          </div>
        </div>
      </div>

      {review.missing.length > 0 && (
        <div className="panel learning-priorities">
          <div className="panel-inner">
            <p className="eyebrow">Next step</p>
            <h2>Add missing skills to your learning plan</h2>
            <div className="list">
              {review.missing.map((item) => (
                <article className="list-row" key={item.skill}>
                  <div>
                    <h3>{item.skill}</h3>
                    <p>{item.explanation}</p>
                  </div>
                  <button
                    className="button compact"
                    type="button"
                    disabled={addedSkills.includes(item.skill)}
                    onClick={() =>
                      addLearningPriority(
                        item.skill,
                        item.explanation,
                      )
                    }
                  >
                    {addedSkills.includes(item.skill)
                      ? "Added"
                      : "Add to learning plan"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <ReviewResultDisplay
        analysis={{
          score: review.score,
          matched: review.matched,
          transferable: review.transferable,
          missing: review.missing,
          suggestions: review.suggestions,
        }}
        questions={review.questions}
        practiceKey={`resume-review-${review.id}`}
        practiceAnswers={review.answers}
        practiceStatuses={review.answerStatuses}
        suggestionStatuses={review.suggestionStatuses}
        starExamples={candidateProfile?.starExamples}
        jobDescription={jobDescription}
        onSavePracticeAnswer={handleSaveAnswer}
        onUpdatePracticeStatus={handleUpdateAnswerStatus}
        onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
      />
    </section>
  );
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
