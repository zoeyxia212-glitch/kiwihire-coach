import { useEffect, useState } from "react";
import { Link } from "react-router";
import DashboardStats from "../components/DashboardStats";
import type { Dashboard } from "../types/dashboard";
import type { CandidateProfile } from "../types/candidateProfile";
import type { LearningGoal } from "../types/learningGoal";
import type { ResumeReview } from "../types/resumeReview";
import {
  getCandidateProfile,
  getDashboard,
  getLearningGoals,
  getResumeReviews,
} from "../utils/api";
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  showDashboardNotifications,
} from "../utils/browserNotifications";
import { getCandidateProfileProgress } from "../utils/candidateProfileProgress";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [reviews, setReviews] = useState<ResumeReview[]>([]);
  const [notificationPermission, setNotificationPermission] =
    useState(getBrowserNotificationPermission);
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
        ] = await Promise.all([
          getDashboard(),
          getCandidateProfile(),
          getLearningGoals(),
          getResumeReviews(),
        ]);
        setDashboard(loadedDashboard);
        setCandidateProfile(loadedProfile);
        setLearningGoals(loadedLearningGoals);
        setReviews(loadedReviews);
        showDashboardNotifications(loadedDashboard);
      } catch {
        setError("Failed to load your dashboard.");
      }
    }

    loadDashboard();
  }, []);

  async function enableBrowserNotifications() {
    const permission = await requestBrowserNotificationPermission();
    setNotificationPermission(permission);

    if (permission === "granted" && dashboard) {
      showDashboardNotifications(dashboard);
    }
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

      <div className="panel browser-reminder-settings">
        <div className="panel-inner">
          <div>
            <p className="eyebrow">Optional local reminder</p>
            <h2>Browser notifications</h2>
            <p className="muted">
              {notificationMessage(notificationPermission)}
            </p>
          </div>
          {notificationPermission === "default" && (
            <button
              className="button"
              type="button"
              onClick={enableBrowserNotifications}
            >
              Enable browser reminders
            </button>
          )}
        </div>
      </div>

      <div className="panel upcoming-reminders">
        <div className="panel-inner">
          <p className="eyebrow">Next 7 days</p>
          <h2>Upcoming reminders</h2>

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

            {dashboard.followUps.length === 0 ? (
              <p className="muted">
                Nothing is due today. Add a next action from an application
                timeline when you need a reminder.
              </p>
            ) : (
              <div className="list">
                {dashboard.followUps.map((followUp) => (
                  <Link
                    className="list-row"
                    key={followUp.eventId}
                    to={`/applications/${followUp.applicationId}`}
                  >
                    <div>
                      <h3>
                        {followUp.company} · {followUp.roleTitle}
                      </h3>
                      <p>
                        {followUp.nextAction || "Follow up"}
                        {` · Due ${followUp.followUpDueDate}`}
                      </p>
                    </div>
                    <span
                      className={
                        followUp.overdue
                          ? "status status-overdue"
                          : "status"
                      }
                    >
                      {followUp.overdue ? "Overdue" : "Due today"}
                    </span>
                  </Link>
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
) {
  if (permission === "granted") {
    return "Enabled. Reminders can appear while KiwiHire Coach is open.";
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
