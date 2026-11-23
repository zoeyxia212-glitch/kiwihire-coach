import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Application } from "../types/application";
import { getApplications } from "../utils/api";
import { buildInsights, MIN_SAMPLE, type InsightRow } from "../utils/insights";

function InsightTable({ title, rows }: { title: string; rows: InsightRow[] }) {
  return (
    <div className="panel">
      <div className="panel-inner">
        <h2>{title}</h2>
        <table className="fit-summary-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Sent</th>
              <th>Responded</th>
              <th>Interviewed</th>
              <th>Offers</th>
              <th>Response rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.submitted}</td>
                <td>{row.responded}</td>
                <td>{row.interviewed}</td>
                <td>{row.offers}</td>
                <td>
                  {row.responseRate === null ? "-" : `${row.responseRate}%`}
                  {row.smallSample && (
                    <small className="muted"> (small sample)</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch(() => setError("Your applications could not be loaded."));
  }, []);

  if (error) {
    return <p className="error-message">{error}</p>;
  }
  if (!applications) {
    return <p className="muted">Loading insights...</p>;
  }

  const insights = buildInsights(applications);

  return (
    <section className="page">
      <p className="eyebrow">Insights</p>
      <h1>Where your applications go</h1>
      <p className="muted">
        Counts use each application&apos;s current status. A role that was
        rejected after an interview counts as a response but not as an
        interview, and groups under {MIN_SAMPLE} applications are marked as
        small samples because a percentage from so few says little.
      </p>

      {insights.total.submitted === 0 ? (
        <p>
          Nothing has been sent yet. Once you mark roles as applied they will
          show up here. <Link to="/applications">Go to applications</Link>
        </p>
      ) : (
        <>
          <p>
            <strong>{insights.total.submitted}</strong> sent,{" "}
            <strong>{insights.total.responded}</strong> responded,{" "}
            <strong>{insights.total.interviewed}</strong> reached an
            interview, <strong>{insights.total.offers}</strong> offers.
          </p>
          {insights.headline && <p>{insights.headline}</p>}
          <InsightTable title="By source" rows={insights.bySource} />
          <InsightTable title="By resume sent" rows={insights.byResume} />
        </>
      )}
    </section>
  );
}
