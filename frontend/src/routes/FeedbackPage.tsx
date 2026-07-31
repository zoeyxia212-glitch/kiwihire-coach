import { FormEvent, useEffect, useState } from "react";
import type {
  ProductFeedback,
  ProductFeedbackCategory,
} from "../types/productFeedback";
import {
  createProductFeedback,
  getProductFeedback,
} from "../utils/api";

const categories: ProductFeedbackCategory[] = [
  "Useful feature",
  "Problem",
  "Confusing experience",
  "Missing feature",
  "Other",
];

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<ProductFeedback[]>([]);
  const [category, setCategory] =
    useState<ProductFeedbackCategory>("Useful feature");
  const [rating, setRating] = useState(5);
  const [wouldUseAgain, setWouldUseAgain] = useState(true);
  const [page, setPage] = useState(window.location.pathname);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadFeedback() {
      try {
        setFeedback(await getProductFeedback());
      } catch {
        setError("Your previous feedback could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedback();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      const savedFeedback = await createProductFeedback({
        category,
        rating,
        page,
        wouldUseAgain,
        message,
      });
      setFeedback((current) => [savedFeedback, ...current]);
      setMessage("");
      setSuccessMessage(
        "Feedback saved. Thank you for helping improve KiwiHire Coach.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Feedback could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const summary = buildFeedbackSummary(feedback);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Product validation</p>
          <h1>Share practical feedback.</h1>
          <p className="muted">
            Tell us what helped, what was confusing, or what stopped you
            from completing a real job-search task.
          </p>
        </div>
      </div>

      <div className="feedback-summary" aria-label="Feedback summary">
        <article className="panel feedback-metric">
          <div className="panel-inner">
            <span>Total responses</span>
            <strong>{feedback.length}</strong>
          </div>
        </article>
        <article className="panel feedback-metric">
          <div className="panel-inner">
            <span>Average usefulness</span>
            <strong>
              {summary.averageRating === null
                ? "—"
                : `${summary.averageRating}/5`}
            </strong>
          </div>
        </article>
        <article className="panel feedback-metric">
          <div className="panel-inner">
            <span>Helpful ratings</span>
            <strong>{summary.helpfulPercentage}%</strong>
            <small>Ratings of 4 or 5</small>
          </div>
        </article>
        <article className="panel feedback-metric">
          <div className="panel-inner">
            <span>Would use again</span>
            <strong>
              {summary.reusePercentage === null
                ? "—"
                : `${summary.reusePercentage}%`}
            </strong>
          </div>
        </article>
      </div>

      <div className="grid two">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-inner form-grid">
            <div className="field">
              <label htmlFor="feedback-category">Category</label>
              <select
                id="feedback-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as ProductFeedbackCategory,
                  )
                }
              >
                {categories.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="feedback-rating">
                Overall usefulness: {rating}/5
              </label>
              <input
                id="feedback-rating"
                type="range"
                min={1}
                max={5}
                value={rating}
                onChange={(event) =>
                  setRating(Number(event.target.value))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="feedback-reuse">
                Would you use KiwiHire Coach again?
              </label>
              <select
                id="feedback-reuse"
                value={String(wouldUseAgain)}
                onChange={(event) =>
                  setWouldUseAgain(event.target.value === "true")
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="feedback-page">
                Page or workflow (optional)
              </label>
              <input
                id="feedback-page"
                value={page}
                maxLength={500}
                placeholder="/review or application timeline"
                onChange={(event) => setPage(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="feedback-message">
                What happened?
              </label>
              <textarea
                id="feedback-message"
                required
                maxLength={2000}
                value={message}
                placeholder="Describe the task you tried, what worked, and what you expected..."
                onChange={(event) => setMessage(event.target.value)}
              />
              <span className="field-help">
                {message.length.toLocaleString()} / 2,000
              </span>
            </div>

            <p className="muted">
              Feedback is stored with your KiwiHire account for product
              validation. It is not sent to an external service.
            </p>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="success-message" role="status">
                {successMessage}
              </p>
            )}
            <button
              className="button primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving feedback..." : "Save feedback"}
            </button>
          </div>
        </form>

        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Your submissions</p>
            <h2>Previous feedback</h2>
            {isLoading && <p className="muted">Loading feedback...</p>}
            {!isLoading && feedback.length === 0 && (
              <p className="muted">
                You have not submitted product feedback yet.
              </p>
            )}
            <div className="list">
              {feedback.map((item) => (
                <article className="list-row" key={item.id}>
                  <div>
                    <h3>{item.category}</h3>
                    <p>{item.message}</p>
                    <p className="muted">
                      {item.rating}/5 · {item.page || "General feedback"}
                      {" · "}
                      {item.wouldUseAgain === null
                        ? "Reuse not answered"
                        : item.wouldUseAgain
                          ? "Would use again"
                          : "Would not use again"}
                      {" · "}
                      {formatFeedbackDate(item.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {feedback.length > 0 && (
        <div className="grid two feedback-breakdown">
          <div className="panel">
            <div className="panel-inner">
              <p className="eyebrow">Feedback themes</p>
              <h2>Responses by category</h2>
              <FeedbackCountList
                entries={summary.categoryCounts}
                total={feedback.length}
              />
            </div>
          </div>
          <div className="panel">
            <div className="panel-inner">
              <p className="eyebrow">Workflow evidence</p>
              <h2>Responses by page</h2>
              <FeedbackCountList
                entries={summary.pageCounts}
                total={feedback.length}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type CountEntry = {
  label: string;
  count: number;
};

function FeedbackCountList({
  entries,
  total,
}: {
  entries: CountEntry[];
  total: number;
}) {
  return (
    <div className="feedback-count-list">
      {entries.map((entry) => (
        <div key={entry.label}>
          <div>
            <span>{entry.label}</span>
            <strong>{entry.count}</strong>
          </div>
          <progress max={total} value={entry.count}>
            {entry.count} of {total}
          </progress>
        </div>
      ))}
    </div>
  );
}

function buildFeedbackSummary(feedback: ProductFeedback[]) {
  const ratingsTotal = feedback.reduce(
    (total, item) => total + item.rating,
    0,
  );
  const reuseAnswers = feedback.filter(
    (item) => item.wouldUseAgain !== null,
  );

  return {
    averageRating:
      feedback.length === 0
        ? null
        : (ratingsTotal / feedback.length).toFixed(1),
    helpfulPercentage:
      feedback.length === 0
        ? 0
        : Math.round(
            (feedback.filter((item) => item.rating >= 4).length
              / feedback.length)
              * 100,
          ),
    reusePercentage:
      reuseAnswers.length === 0
        ? null
        : Math.round(
            (reuseAnswers.filter((item) => item.wouldUseAgain).length
              / reuseAnswers.length)
              * 100,
          ),
    categoryCounts: countValues(
      feedback.map((item) => item.category),
    ),
    pageCounts: countValues(
      feedback.map((item) => item.page || "General feedback"),
    ),
  };
}

function countValues(values: string[]): CountEntry[] {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) =>
      second.count === first.count
        ? first.label.localeCompare(second.label)
        : second.count - first.count,
    );
}

function formatFeedbackDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
