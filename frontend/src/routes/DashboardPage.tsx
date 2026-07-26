import { useEffect, useState } from "react";
import { Link } from "react-router";
import DashboardStats from "../components/DashboardStats";
import type { Dashboard } from "../types/dashboard";
import { getDashboard } from "../utils/api";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboard(await getDashboard());
      } catch {
        setError("Failed to load your dashboard.");
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!dashboard) {
    return <p className="muted">Loading your workspace...</p>;
  }

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
