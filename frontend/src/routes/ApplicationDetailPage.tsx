export default function ApplicationDetailPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Application</p>
          <h1>Xero · Junior Software Developer</h1>
          <p className="muted">Auckland · Company website · Applied last week</p>
        </div>
        <span className="status">Interview</span>
      </div>

      <div className="grid two">
        <div className="panel">
          <div className="panel-inner">
            <h2>Job notes</h2>
            <p className="muted">
              React, TypeScript, REST APIs, SQL, and clear communication with product teams.
            </p>
          </div>
        </div>
        <div className="panel">
          <div className="panel-inner">
            <h2>Next step</h2>
            <p className="muted">Prepare two project stories and one database trade-off example.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
