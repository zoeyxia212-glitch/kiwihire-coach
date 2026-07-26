import { useEffect, useState } from "react";
import type {
  LearningGoal,
  LearningGoalStatus,
} from "../types/learningGoal";
import {
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
  const [error, setError] = useState("");

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

      <div className="panel">
        <div className="panel-inner">
          {!goals.length ? (
            <>
              <h2>No learning goals yet</h2>
              <p className="muted">
                Open a saved resume review and add one of its missing
                skills to begin.
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
