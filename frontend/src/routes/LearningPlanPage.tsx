import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type {
  LearningGoal,
  LearningGoalStatus,
} from "../types/learningGoal";
import {
  createLearningGoal,
  deleteLearningGoal,
  getLearningGoals,
  updateLearningGoal,
} from "../utils/api";

const statuses: LearningGoalStatus[] = [
  "To learn",
  "In progress",
  "Completed",
];

export default function LearningPlanPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [skill, setSkill] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadGoals() {
      try {
        setGoals(await getLearningGoals());
      } catch {
        setError("Your learning plan could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadGoals();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSkill = skill.trim();

    if (!normalizedSkill) {
      setError("Enter a skill or topic.");
      return;
    }

    const alreadyExists = goals.some(
      (goal) =>
        goal.skill.toLowerCase() === normalizedSkill.toLowerCase(),
    );
    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const goal = await createLearningGoal({
        skill: normalizedSkill,
        reason,
        sourceReviewId: null,
      });
      setGoals((currentGoals) => [
        goal,
        ...currentGoals.filter(
          (currentGoal) => currentGoal.id !== goal.id,
        ),
      ]);
      setSuccess(
        alreadyExists
          ? `"${goal.skill}" is already in your learning plan.`
          : `"${goal.skill}" was added to your learning plan.`,
      );

      if (!alreadyExists) {
        setSkill("");
        setReason("");
      }
    } catch {
      setError("The learning goal could not be added.");
    } finally {
      setIsCreating(false);
    }
  }

  async function changeStatus(
    goal: LearningGoal,
    status: LearningGoalStatus,
  ) {
    setError("");

    try {
      const updatedGoal = await updateLearningGoal(goal.id, status);
      setGoals((currentGoals) =>
        currentGoals.map((currentGoal) =>
          currentGoal.id === updatedGoal.id
            ? updatedGoal
            : currentGoal,
        ),
      );
    } catch {
      setError("The learning goal could not be updated.");
    }
  }

  async function handleDelete(goal: LearningGoal) {
    const confirmed = window.confirm(
      `Remove "${goal.skill}" from your learning plan?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteLearningGoal(goal.id);
      setGoals((currentGoals) =>
        currentGoals.filter(
          (currentGoal) => currentGoal.id !== goal.id,
        ),
      );
    } catch {
      setError("The learning goal could not be deleted.");
    }
  }

  if (isLoading) {
    return <p className="muted">Loading learning plan...</p>;
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Skill development</p>
          <h1>Learning plan</h1>
          <p className="muted">
            Turn missing job requirements into a focused and honest
            development plan.
          </p>
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <form
        className="panel learning-create"
        onSubmit={handleCreate}
      >
        <div className="panel-inner form-grid">
          <div>
            <p className="eyebrow">Add your own priority</p>
            <h2>New learning goal</h2>
          </div>
          <div className="field">
            <label htmlFor="learning-skill">Skill or topic</label>
            <input
              id="learning-skill"
              value={skill}
              maxLength={120}
              required
              placeholder="Docker, AWS, behavioural interviews..."
              onChange={(event) => setSkill(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="learning-reason">
              Why it matters (optional)
            </label>
            <textarea
              id="learning-reason"
              value={reason}
              maxLength={2000}
              placeholder="This skill appears frequently in the roles I want."
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          {success && (
            <p className="success-message" role="status">
              {success}
            </p>
          )}
          <button
            className="button primary"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Adding goal..." : "Add learning goal"}
          </button>
        </div>
      </form>

      <div className="panel">
        <div className="panel-inner">
          {!goals.length ? (
            <>
              <h2>No learning goals yet</h2>
              <p className="muted">
                Add a goal above or open a saved resume review and add
                one of its missing skills.
              </p>
            </>
          ) : (
            <div className="list">
              {goals.map((goal) => (
                <article className="list-row" key={goal.id}>
                  <div>
                    <p className="eyebrow">Learning priority</p>
                    <h3>{goal.skill}</h3>
                    <p>{goal.reason}</p>
                  </div>
                  <div className="learning-goal-actions">
                    <select
                      aria-label={`Status for ${goal.skill}`}
                      value={goal.status}
                      onChange={(event) =>
                        changeStatus(
                          goal,
                          event.target.value as LearningGoalStatus,
                        )
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => handleDelete(goal)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
