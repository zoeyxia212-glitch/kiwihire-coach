import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ReviewResultDisplay from "../components/ReviewResultDisplay";
import type { ResumeReview } from "../types/resumeReview";
import {
  createLearningGoal,
  deleteResumeReview,
  getResumeReviewById,
  updateResumeReviewAnswers,
  updateResumeReviewFeedback,
} from "../utils/api";

export default function SavedReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReview() {
      setIsLoading(true);
      setReview(null);
      setError("");

      if (!id) {
        setError("Review not found.");
        setIsLoading(false);
        return;
      }

      try {
        setReview(await getResumeReviewById(id));
      } catch {
        setError("This saved review could not be loaded.");
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
        await updateResumeReviewFeedback(review.id, helpful),
      );
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
        <div className="form-actions">
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
        onSavePracticeAnswer={handleSaveAnswer}
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
