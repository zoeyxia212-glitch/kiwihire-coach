import { useEffect, useState } from "react";
import { Link } from "react-router";
import DashboardStats from "../components/DashboardStats";
import type { Dashboard } from "../types/dashboard";
import type { CandidateProfile } from "../types/candidateProfile";
import type { LearningGoal } from "../types/learningGoal";
import type { ResumeReview } from "../types/resumeReview";
import type { Application } from "../types/application";
import {
  createApplicationEvent,
  getCandidateProfile,
  getDashboard,
  getApplications,
  getLearningGoals,
  getResumeReviews,
  updateApplicationFollowUp,
} from "../utils/api";
import {
  getBrowserNotificationPermission,
  getBrowserNotificationsEnabled,
  requestBrowserNotificationPermission,
  setBrowserNotificationsEnabled,
  showDashboardNotifications,
  showTestBrowserNotification,
} from "../utils/browserNotifications";
import { getCandidateProfileProgress } from "../utils/candidateProfileProgress";
import { downloadReminderCalendar } from "../utils/reminderCalendar";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [reviews, setReviews] = useState<ResumeReview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [quickApplicationId, setQuickApplicationId] = useState("");
  const [quickNextAction, setQuickNextAction] = useState("");
  const [quickDueDate, setQuickDueDate] = useState("");
  const [editingDueEventId, setEditingDueEventId] =
    useState<number | null>(null);
  const [editingDueDate, setEditingDueDate] = useState("");
  const [followUpStatus, setFollowUpStatus] = useState("");
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState(getBrowserNotificationPermission);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(getBrowserNotificationsEnabled);
  const [notificationStatus, setNotificationStatus] = useState("");
  const [error, setError] = useState("");
  const [inactiveThreshold, setInactiveThreshold] = useState(14);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          loadedDashboard,
          loadedProfile,
          loadedLearningGoals,
          loadedReviews,
          loadedApplications,
        ] = await Promise.all([
          getDashboard(),
          getCandidateProfile(),
          getLearningGoals(),
          getResumeReviews(),
          getApplications(),
        ]);
        setDashboard(loadedDashboard);
        setCandidateProfile(loadedProfile);
        setLearningGoals(loadedLearningGoals);
        setReviews(loadedReviews);
        setApplications(
          loadedApplications.filter((application) => !application.archived),
        );
        showDashboardNotifications(loadedDashboard);
      } catch {
        setError("Failed to load your dashboard.");
      }
    }

    loadDashboard();
  }, []);

  async function refreshDashboard() {
    const loadedDashboard = await getDashboard();
    setDashboard(loadedDashboard);
    return loadedDashboard;
  }

  async function completeFollowUp(
    applicationId: number,
    eventId: number,
  ) {
    setFollowUpStatus("");
    setIsSavingFollowUp(true);

    try {
      await updateApplicationFollowUp(String(applicationId), eventId, {
        completed: true,
      });
      await refreshDashboard();
      setFollowUpStatus("Follow-up completed.");
    } catch {
      setFollowUpStatus("Failed to complete the follow-up.");
    } finally {
      setIsSavingFollowUp(false);
    }
  }

  async function postponeFollowUp(
    applicationId: number,
    eventId: number,
  ) {
    if (!editingDueDate) {
      setFollowUpStatus("Choose a new follow-up date.");
      return;
    }

    setFollowUpStatus("");
    setIsSavingFollowUp(true);

    try {
      await updateApplicationFollowUp(String(applicationId), eventId, {
        followUpDueDate: editingDueDate,
      });
      await refreshDashboard();
      setEditingDueEventId(null);
      setEditingDueDate("");
      setFollowUpStatus("Follow-up date updated.");
    } catch {
      setFollowUpStatus("Failed to postpone the follow-up.");
    } finally {
      setIsSavingFollowUp(false);
    }
  }

  async function createQuickFollowUp(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const application = applications.find(
      (candidate) => String(candidate.id) === quickApplicationId,
    );

    if (!application || !quickNextAction.trim() || !quickDueDate) {
      setFollowUpStatus(
        "Choose an application, next action, and due date.",
      );
      return;
    }

    setFollowUpStatus("");
    setIsSavingFollowUp(true);

    try {
      await createApplicationEvent(String(application.id), {
        stage: application.status,
        occurredAt: currentLocalDateTime(),
        contactPerson: "",
        notes: "Follow-up created from Dashboard.",
        nextAction: quickNextAction.trim(),
        followUpDueDate: quickDueDate,
      });
      await refreshDashboard();
      setQuickNextAction("");
      setQuickDueDate("");
      setFollowUpStatus("Next follow-up created.");
    } catch {
      setFollowUpStatus("Failed to create the follow-up.");
    } finally {
      setIsSavingFollowUp(false);
    }
  }

  async function enableBrowserNotifications() {
    const permission =
      notificationPermission === "granted"
        ? "granted"
        : await requestBrowserNotificationPermission();
    setNotificationPermission(permission);

    if (permission === "granted" && dashboard) {
      setBrowserNotificationsEnabled(true);
      setNotificationsEnabled(true);
      const notificationCount =
        showDashboardNotifications(dashboard);
      setNotificationStatus(
        notificationCount
          ? `${notificationCount} reminder notification${notificationCount === 1 ? "" : "s"} sent.`
          : "Reminders enabled. Nothing is due in the next 24 hours.",
      );
    } else if (permission === "denied") {
      setNotificationStatus(
        "Your browser blocked notifications. Use the site permission settings to allow them.",
      );
    }
  }

  function disableBrowserNotifications() {
    setBrowserNotificationsEnabled(false);
    setNotificationsEnabled(false);
    setNotificationStatus(
      "KiwiHire browser reminders are turned off on this device.",
    );
  }

  function sendTestNotification() {
    const wasSent = showTestBrowserNotification();
    setNotificationStatus(
      wasSent
        ? "Test notification sent."
        : "Allow browser notifications before sending a test.",
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!dashboard) {
    return <p className="muted">Loading your workspace...</p>;
  }

  const profileProgress = candidateProfile
    ? getCandidateProfileProgress(candidateProfile)
    : null;
  const completedLearningGoals = learningGoals.filter(
    (goal) => goal.status === "Completed",
  ).length;
  const activeLearningGoals = learningGoals.filter(
    (goal) => goal.status === "In progress",
  ).length;
  const totalInterviewQuestions = reviews.reduce(
    (total, review) => total + review.questions.length,
    0,
  );
  const readyInterviewAnswers = reviews.reduce(
    (total, review) =>
      total +
      review.answerStatuses.filter((status) => status === "Ready")
        .length,
    0,
  );
  const draftedInterviewAnswers = reviews.reduce(
    (total, review) =>
      total +
      review.answerStatuses.filter((status) => status === "Drafted")
        .length,
    0,
  );
  const inactiveApplications = dashboard.inactiveApplications.filter(
    (application) =>
      daysSince(application.lastActivityAt) >= inactiveThreshold,
  );
  const statusCounts = buildStatusCounts(applications);
  const recentReviews = [...reviews]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime()
        - new Date(first.createdAt).getTime(),
    )
    .slice(0, 3);
  const priorityLearningGoals = learningGoals
    .filter((goal) => goal.status !== "Completed")
    .slice(0, 3);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your job search workspace</p>
          <h1>What needs your attention?</h1>
          <p className="muted">
            Review today&apos;s follow-ups and keep each application moving.
          </p>
        </div>
        <Link className="button primary" to="/applications/new">
          New application
        </Link>
      </div>

      <DashboardStats
        totalApplications={dashboard.totalApplications}
        interviewApplications={dashboard.interviewApplications}
        dueToday={dashboard.dueToday}
        overdue={dashboard.overdue}
      />

      {profileProgress && profileProgress.percentage < 100 && (
        <div className="panel dashboard-profile-prompt">
          <div className="panel-inner">
            <div>
              <p className="eyebrow">Improve review context</p>
              <h2>
                Candidate Profile is {profileProgress.percentage}%
                complete
              </h2>
              <p className="muted">
                Add {profileProgress.missing.join(", ")} so resume
                reviews can use more of your real background.
              </p>
            </div>
            <Link className="button" to="/profile">
              Complete profile
            </Link>
          </div>
        </div>
      )}

      <div className="grid two preparation-overview">
        <Link className="panel progress-card" to="/learning">
          <div className="panel-inner">
            <p className="eyebrow">Learning plan</p>
            <h2>
              {completedLearningGoals} / {learningGoals.length} complete
            </h2>
            <p className="muted">
              {activeLearningGoals
                ? `${activeLearningGoals} currently in progress.`
                : learningGoals.length
                  ? "Choose a goal and move it into progress."
                  : "Add missing skills from a saved resume review."}
            </p>
          </div>
        </Link>

        <Link className="panel progress-card" to="/review">
          <div className="panel-inner">
            <p className="eyebrow">Interview preparation</p>
            <h2>
              {readyInterviewAnswers} / {totalInterviewQuestions} ready
            </h2>
            <p className="muted">
              {draftedInterviewAnswers
                ? `${draftedInterviewAnswers} drafted answers still need practice.`
                : totalInterviewQuestions
                  ? "Open a saved review to continue practising."
                  : "Save a resume review to generate interview questions."}
            </p>
          </div>
        </Link>
      </div>

      <div className="grid two dashboard-insights">
        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Pipeline health</p>
            <h2>Applications by status</h2>
            {statusCounts.length === 0 ? (
              <p className="muted">
                Add an application to see your pipeline distribution.
              </p>
            ) : (
              <div className="dashboard-status-list">
                {statusCounts.map(({ status, count }) => (
                  <Link
                    key={status}
                    to={`/applications?status=${encodeURIComponent(status)}`}
                    className="dashboard-status-row"
                  >
                    <span>{status}</span>
                    <strong>{count}</strong>
                    <progress
                      aria-label={`${status}: ${count} applications`}
                      value={count}
                      max={applications.length}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Next preparation actions</p>
            <h2>Priority learning goals</h2>
            {priorityLearningGoals.length === 0 ? (
              <p className="muted">
                No open learning goals. Add a missing skill from a
                saved review.
              </p>
            ) : (
              <div className="list">
                {priorityLearningGoals.map((goal) => (
                  <Link
                    className="list-row"
                    key={goal.id}
                    to="/learning"
                  >
                    <div>
                      <h3>{goal.skill}</h3>
                      <p>{goal.reason}</p>
                    </div>
                    <span className="status">{goal.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel dashboard-recent-reviews">
        <div className="panel-inner">
          <div className="section-heading-with-control">
            <div>
              <p className="eyebrow">Saved preparation</p>
              <h2>Recent resume reviews</h2>
            </div>
            <Link className="button compact" to="/review">
              View all reviews
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="muted">
              Run and save a resume review to continue preparation
              from the Dashboard.
            </p>
          ) : (
            <div className="list">
              {recentReviews.map((review) => {
                const readyAnswers = review.answerStatuses.filter(
                  (status) => status === "Ready",
                ).length;

                return (
                  <Link
                    className="list-row"
                    key={review.id}
                    to={`/reviews/${review.id}`}
                  >
                    <div>
                      <h3>
                        {review.company} · {review.roleTitle}
                      </h3>
                      <p>
                        {review.resumeName} · {readyAnswers}/
                        {review.questions.length} answers ready
                      </p>
                    </div>
                    <span className="status">
                      {review.score === null
                        ? "No score"
                        : `${review.score}%`}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="panel browser-reminder-settings">
        <div className="panel-inner">
          <div>
            <p className="eyebrow">Optional local reminder</p>
            <h2>Browser notifications</h2>
            <p className="muted">
              {notificationMessage(
                notificationPermission,
                notificationsEnabled,
              )}
            </p>
            <p className="muted">
              These free reminders run locally while KiwiHire Coach is
              open. They are not email, SMS, or background push
              notifications.
            </p>
            {notificationStatus && (
              <p className="success-message" role="status">
                {notificationStatus}
              </p>
            )}
          </div>
          <div className="form-actions">
          {notificationPermission !== "unsupported" &&
            notificationPermission !== "denied" &&
            !notificationsEnabled && (
            <button
              className="button"
              type="button"
              onClick={enableBrowserNotifications}
            >
              Enable browser reminders
            </button>
          )}
          {notificationPermission === "granted" &&
            notificationsEnabled && (
              <>
                <button
                  className="button"
                  type="button"
                  onClick={sendTestNotification}
                >
                  Send test notification
                </button>
                <button
                  className="button"
                  type="button"
                  onClick={disableBrowserNotifications}
                >
                  Turn off reminders
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="panel upcoming-reminders">
        <div className="panel-inner">
          <p className="eyebrow">Next 7 days</p>
          <h2>Upcoming reminders</h2>
          {dashboard.upcomingReminders.length > 0 && (
            <div className="form-actions">
              <button
                className="button"
                type="button"
                onClick={() =>
                  downloadReminderCalendar(
                    dashboard.upcomingReminders,
                  )
                }
              >
                Download calendar reminders
              </button>
            </div>
          )}

          {dashboard.upcomingReminders.length === 0 ? (
            <p className="muted">
              No interviews, follow-ups, or closing dates are recorded
              for the next seven days.
            </p>
          ) : (
            <div className="list">
              {dashboard.upcomingReminders.map((reminder, index) => (
                <Link
                  className="list-row"
                  key={`${reminder.type}-${reminder.applicationId}-${reminder.dueAt}-${index}`}
                  to={`/applications/${reminder.applicationId}`}
                >
                  <div>
                    <p className="eyebrow">{reminder.type}</p>
                    <h3>
                      {reminder.company} · {reminder.roleTitle}
                    </h3>
                    <p>
                      {reminder.title}
                      {` · ${formatReminderDate(reminder.dueAt)}`}
                    </p>
                  </div>
                  <span className="status">{reminder.type}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel inactive-applications">
        <div className="panel-inner">
          <div className="section-heading-with-control">
            <div>
              <p className="eyebrow">Needs attention</p>
              <h2>Applications without recent activity</h2>
            </div>
            <label>
              <span>Inactive for</span>
              <select
                value={inactiveThreshold}
                onChange={(event) =>
                  setInactiveThreshold(Number(event.target.value))
                }
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </label>
          </div>

          {inactiveApplications.length === 0 ? (
            <p className="muted">
              Every open application has activity within this period.
            </p>
          ) : (
            <div className="list">
              {inactiveApplications.map((application) => (
                <Link
                  className="list-row"
                  key={application.applicationId}
                  to={`/applications/${application.applicationId}`}
                >
                  <div>
                    <h3>
                      {application.company} · {application.roleTitle}
                    </h3>
                    <p>
                      Last activity{" "}
                      {formatReminderDate(application.lastActivityAt)}
                    </p>
                  </div>
                  <span className="status status-overdue">
                    {daysSince(application.lastActivityAt)} days
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid two dashboard-sections">
        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Priority</p>
            <h2>Follow-ups</h2>
            <form
              className="dashboard-follow-up-form"
              onSubmit={createQuickFollowUp}
            >
              <div className="field">
                <label htmlFor="quick-follow-up-application">
                  Application
                </label>
                <select
                  id="quick-follow-up-application"
                  value={quickApplicationId}
                  onChange={(event) =>
                    setQuickApplicationId(event.target.value)
                  }
                >
                  <option value="">Choose application</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.company} · {application.roleTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="quick-follow-up-action">
                  Next action
                </label>
                <input
                  id="quick-follow-up-action"
                  value={quickNextAction}
                  maxLength={300}
                  placeholder="Email the recruiter"
                  onChange={(event) =>
                    setQuickNextAction(event.target.value)
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="quick-follow-up-date">Due date</label>
                <input
                  id="quick-follow-up-date"
                  type="date"
                  value={quickDueDate}
                  onChange={(event) =>
                    setQuickDueDate(event.target.value)
                  }
                />
              </div>
              <button
                className="button compact"
                type="submit"
                disabled={isSavingFollowUp}
              >
                Add follow-up
              </button>
            </form>
            {followUpStatus && (
              <p className="info-message" role="status">
                {followUpStatus}
              </p>
            )}

            {dashboard.followUps.length === 0 ? (
              <p className="muted">
                Nothing is due today. Add a next action from an application
                timeline when you need a reminder.
              </p>
            ) : (
              <div className="list">
                {dashboard.followUps.map((followUp) => (
                  <article
                    className="list-row"
                    key={followUp.eventId}
                  >
                    <div>
                      <h3>
                        {followUp.company} · {followUp.roleTitle}
                      </h3>
                      <p>
                        {followUp.nextAction || "Follow up"}
                        {` · Due ${followUp.followUpDueDate}`}
                      </p>
                      {editingDueEventId === followUp.eventId && (
                        <div className="form-actions">
                          <input
                            aria-label="New follow-up date"
                            type="date"
                            value={editingDueDate}
                            onChange={(event) =>
                              setEditingDueDate(event.target.value)
                            }
                          />
                          <button
                            className="button compact"
                            type="button"
                            disabled={isSavingFollowUp}
                            onClick={() =>
                              postponeFollowUp(
                                followUp.applicationId,
                                followUp.eventId,
                              )
                            }
                          >
                            Save date
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="follow-up-actions">
                      <span
                        className={
                          followUp.overdue
                            ? "status status-overdue"
                            : "status"
                        }
                      >
                        {followUp.overdue ? "Overdue" : "Due today"}
                      </span>
                      <button
                        className="button compact"
                        type="button"
                        disabled={isSavingFollowUp}
                        onClick={() =>
                          completeFollowUp(
                            followUp.applicationId,
                            followUp.eventId,
                          )
                        }
                      >
                        Complete
                      </button>
                      <button
                        className="button compact"
                        type="button"
                        onClick={() => {
                          setEditingDueEventId(followUp.eventId);
                          setEditingDueDate(followUp.followUpDueDate);
                        }}
                      >
                        Postpone
                      </button>
                      <Link
                        className="button compact"
                        to={`/applications/${followUp.applicationId}`}
                      >
                        Open
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-inner">
            <p className="eyebrow">Latest activity</p>
            <h2>Recent applications</h2>

            {dashboard.recentApplications.length === 0 ? (
              <div>
                <p className="muted">
                  Save your first role to begin tracking applications.
                </p>
                <Link className="button" to="/applications/new">
                  Add first application
                </Link>
              </div>
            ) : (
              <div className="list">
                {dashboard.recentApplications.map((application) => (
                  <Link
                    className="list-row"
                    key={application.id}
                    to={`/applications/${application.id}`}
                  >
                    <div>
                      <h3>{application.company}</h3>
                      <p>{application.roleTitle}</p>
                    </div>
                    <span className="status">
                      {application.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatReminderDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function notificationMessage(
  permission: NotificationPermission | "unsupported",
  enabled: boolean,
) {
  if (permission === "granted" && enabled) {
    return "Enabled. Reminders can appear while KiwiHire Coach is open.";
  }

  if (permission === "granted") {
    return "Browser permission is available, but KiwiHire reminders are turned off on this device.";
  }

  if (permission === "denied") {
    return "Blocked by your browser. Change this in the site permissions if you want to enable it.";
  }

  if (permission === "unsupported") {
    return "This browser does not support local notifications.";
  }

  return "Get local alerts for urgent follow-ups, interviews, and closing dates while this site is open.";
}

function daysSince(value: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(value).getTime()) / millisecondsPerDay,
    ),
  );
}

function currentLocalDateTime() {
  const now = new Date();
  const localTime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000,
  );

  return localTime.toISOString().slice(0, 16);
}

function buildStatusCounts(applications: Application[]) {
  const counts = new Map<string, number>();

  applications.forEach((application) => {
    counts.set(
      application.status,
      (counts.get(application.status) ?? 0) + 1,
    );
  });

  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((first, second) =>
      second.count === first.count
        ? first.status.localeCompare(second.status)
        : second.count - first.count,
    );
}
