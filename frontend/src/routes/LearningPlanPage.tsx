import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import type {
  LearningGoal,
  LearningGoalStatus,
  SkillGapInsight,
} from "../types/learningGoal";
import {
  createEvidenceFromLearningGoal,
  createLearningGoal,
  deleteLearningGoal,
  getLearningGoals,
  getEvidenceItems,
  getSkillGapInsights,
  updateLearningGoal,
} from "../utils/api";
import { downloadLearningGoalCalendar } from "../utils/reminderCalendar";
import { downloadLearningProgressReport } from "../utils/learningProgressReport";

const statuses: LearningGoalStatus[] = [
  "To learn",
  "In progress",
  "Completed",
];

export default function LearningPlanPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapInsight[]>([]);
  const [evidenceGoalIds, setEvidenceGoalIds] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [skill, setSkill] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadGoals() {
      try {
        const [loadedGoals, loadedSkillGaps, evidenceItems] = await Promise.all([
          getLearningGoals(),
          getSkillGapInsights(),
          getEvidenceItems(),
        ]);
        setGoals(loadedGoals);
        setSkillGaps(loadedSkillGaps);
        setEvidenceGoalIds(
          new Set(
            evidenceItems
              .map((item) => item.sourceLearningGoalId)
              .filter((id): id is number => id !== null),
          ),
        );
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

  async function addSuggestedGoal(gap: SkillGapInsight) {
    setError("");
    setSuccess("");

    try {
      const goal = await createLearningGoal({
        skill: gap.skill,
        reason: `Missing from ${gap.applicationCount} target ${gap.applicationCount === 1 ? "role" : "roles"}: ${gap.exampleRoles.join(", ")}.`,
        sourceReviewId: gap.sourceReviewId,
      });
      setGoals((currentGoals) => [
        goal,
        ...currentGoals.filter((currentGoal) => currentGoal.id !== goal.id),
      ]);
      setSkillGaps((currentGaps) =>
        currentGaps.map((currentGap) =>
          currentGap.skill.toLowerCase() === gap.skill.toLowerCase()
            ? {
                ...currentGap,
                learningGoalId: goal.id,
                learningGoalStatus: goal.status,
              }
            : currentGap,
        ),
      );
      setSuccess(`"${goal.skill}" was added to your learning plan.`);
    } catch {
      setError("The suggested learning goal could not be added.");
    }
  }

  async function changeStatus(
    goal: LearningGoal,
    status: LearningGoalStatus,
  ) {
    setError("");

    try {
      const updatedGoal = await updateLearningGoal(goal.id, {
        status,
        nextAction: goal.nextAction,
        targetDate: goal.targetDate,
        outcomeEvidence: goal.outcomeEvidence,
      });
      setGoals((currentGoals) =>
        currentGoals.map((currentGoal) =>
          currentGoal.id === updatedGoal.id
            ? updatedGoal
            : currentGoal,
        ),
      );
      setSkillGaps((currentGaps) =>
        currentGaps.map((gap) =>
          gap.learningGoalId === updatedGoal.id
            ? { ...gap, learningGoalStatus: updatedGoal.status }
            : gap,
        ),
      );
    } catch {
      setError("The learning goal could not be updated.");
    }
  }

  async function saveGoalPlan(
    event: FormEvent<HTMLFormElement>,
    goal: LearningGoal,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setSuccess("");

    try {
      const updatedGoal = await updateLearningGoal(goal.id, {
        status: goal.status,
        nextAction: String(formData.get("nextAction") ?? "").trim(),
        targetDate: String(formData.get("targetDate") ?? "") || null,
        outcomeEvidence: String(
          formData.get("outcomeEvidence") ?? "",
        ).trim(),
      });
      setGoals((currentGoals) =>
        currentGoals.map((currentGoal) =>
          currentGoal.id === updatedGoal.id
            ? updatedGoal
            : currentGoal,
        ),
      );
      setSuccess(`Plan for "${goal.skill}" was saved.`);
    } catch {
      setError("The learning plan details could not be saved.");
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
      setSkillGaps((currentGaps) =>
        currentGaps.map((gap) =>
          gap.learningGoalId === goal.id
            ? {
                ...gap,
                learningGoalId: null,
                learningGoalStatus: null,
              }
            : gap,
        ),
      );
    } catch {
      setError("The learning goal could not be deleted.");
    }
  }

  async function addGoalToEvidenceBank(goal: LearningGoal) {
    setError("");
    setSuccess("");

    try {
      await createEvidenceFromLearningGoal(goal.id);
      setEvidenceGoalIds((currentIds) => {
        const updatedIds = new Set(currentIds);
        updatedIds.add(goal.id);
        return updatedIds;
      });
      setSuccess(`"${goal.skill}" was added to your evidence bank.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "The learning outcome could not be added as evidence.",
      );
    }
  }

  if (isLoading) {
    return <p className="muted">Loading learning plan...</p>;
  }

  const openGoals = goals.filter((goal) => goal.status !== "Completed");
  const overdueGoals = openGoals.filter(isGoalOverdue).length;
  const dueSoonGoals = openGoals.filter(isGoalDueWithinSevenDays).length;
  const goalsWithoutAction = openGoals.filter(
    (goal) => !goal.nextAction.trim(),
  ).length;
  const scheduledGoals = openGoals.filter((goal) => goal.targetDate);

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
        {goals.length > 0 && (
          <div className="page-header-actions">
            {scheduledGoals.length > 0 && (
              <button
                className="button secondary"
                type="button"
                onClick={() => downloadLearningGoalCalendar(scheduledGoals)}
              >
                Download calendar
              </button>
            )}
            <button
              className="button secondary"
              type="button"
              onClick={() => downloadLearningProgressReport(goals)}
            >
              Download progress report
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {goals.length > 0 && (
        <div className="learning-plan-overview" aria-label="Learning plan overview">
          <article>
            <strong>{openGoals.length}</strong>
            <span>Open goals</span>
          </article>
          <article className={overdueGoals ? "needs-attention" : ""}>
            <strong>{overdueGoals}</strong>
            <span>Overdue</span>
          </article>
          <article>
            <strong>{dueSoonGoals}</strong>
            <span>Due in 7 days</span>
          </article>
          <article className={goalsWithoutAction ? "needs-attention" : ""}>
            <strong>{goalsWithoutAction}</strong>
            <span>Need a next action</span>
          </article>
        </div>
      )}

      {skillGaps.length > 0 && (
        <div className="panel skill-gap-panel">
          <div className="panel-inner">
            <p className="eyebrow">Evidence-based priorities</p>
            <h2>Repeated gaps from your target roles</h2>
            <p className="muted">
              Based on the latest CV review for each application, so
              reviewing one role twice does not inflate the count.
            </p>
            <div className="skill-gap-grid">
              {skillGaps.map((gap) => (
                <article className="skill-gap-card" key={gap.skill}>
                  <div>
                    <span className="status-badge">
                      {gap.applicationCount} {gap.applicationCount === 1 ? "role" : "roles"}
                    </span>
                    <h3>{gap.skill}</h3>
                    <p className="muted">{gap.exampleRoles.join(" · ")}</p>
                  </div>
                  {gap.learningGoalId ? (
                    <span className="muted">
                      In plan · {gap.learningGoalStatus}
                    </span>
                  ) : (
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => addSuggestedGoal(gap)}
                    >
                      Add to learning plan
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
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
                <article className="list-row learning-goal-row" key={goal.id}>
                  <div>
                    <p className="eyebrow">Learning priority</p>
                    <h3>{goal.skill}</h3>
                    <p>{goal.reason}</p>
                    {goal.completedAt && (
                      <p className="learning-completed-date">
                        Completed {formatCompletedDate(goal.completedAt)}
                      </p>
                    )}
                    {goal.sourceReviewId && (
                      <Link
                        className="learning-source-link"
                        to={`/reviews/${goal.sourceReviewId}`}
                      >
                        View source CV review →
                      </Link>
                    )}
                    <form
                      className="learning-action-form"
                      onSubmit={(event) => saveGoalPlan(event, goal)}
                    >
                      <div className="field">
                        <label htmlFor={`next-action-${goal.id}`}>
                          Next practical action
                        </label>
                        <input
                          id={`next-action-${goal.id}`}
                          name="nextAction"
                          defaultValue={goal.nextAction}
                          maxLength={500}
                          placeholder="Build a small example, finish a lesson, or practise one task"
                        />
                      </div>
                      <div className="field learning-target-date">
                        <label htmlFor={`target-date-${goal.id}`}>
                          Target date
                        </label>
                        <input
                          id={`target-date-${goal.id}`}
                          name="targetDate"
                          type="date"
                          defaultValue={goal.targetDate ?? ""}
                        />
                      </div>
                      <button className="button secondary" type="submit">
                        Save plan
                      </button>
                      <div className="field learning-evidence-field">
                        <label htmlFor={`outcome-evidence-${goal.id}`}>
                          Learning evidence or outcome
                        </label>
                        <textarea
                          id={`outcome-evidence-${goal.id}`}
                          name="outcomeEvidence"
                          defaultValue={goal.outcomeEvidence}
                          maxLength={2000}
                          placeholder="What did you build or practise? Add a GitHub link, result, or lesson learned."
                        />
                      </div>
                    </form>
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
                    {evidenceGoalIds.has(goal.id) ? (
                      <Link className="text-button" to="/profile">
                        Saved to evidence bank
                      </Link>
                    ) : goal.status === "Completed" && goal.outcomeEvidence ? (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => addGoalToEvidenceBank(goal)}
                      >
                        Add to evidence bank
                      </button>
                    ) : null}
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

function localDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isGoalOverdue(goal: LearningGoal) {
  return Boolean(goal.targetDate && goal.targetDate < localDateKey());
}

function isGoalDueWithinSevenDays(goal: LearningGoal) {
  if (!goal.targetDate || isGoalOverdue(goal)) {
    return false;
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  return goal.targetDate <= localDateKey(endDate);
}

function formatCompletedDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
  }).format(new Date(value));
}
