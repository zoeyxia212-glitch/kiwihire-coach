import DashboardStats from "../components/DashboardStats";

export default function DashboardPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">NZ junior job search</p>
          <h1>Focus the next application.</h1>
          <p className="muted">Track roles, compare your resume, and learn what to improve next.</p>
        </div>
        <a className="button primary" href="/applications/new">New application</a>
      </div>
      <DashboardStats />

      <div className="grid two" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="panel-inner">
            <h2>Recent applications</h2>
            <div className="list">
              <div className="list-row">
                <div>
                  <h3>Xero</h3>
                  <p>Junior Software Developer · Auckland</p>
                </div>
                <span className="status">Interview</span>
              </div>
              <div className="list-row">
                <div>
                  <h3>Datacom</h3>
                  <p>Graduate Developer · Wellington</p>
                </div>
                <span className="status">Applied</span>
              </div>
              <div className="list-row">
                <div>
                  <h3>Fisher & Paykel</h3>
                  <p>Frontend Developer · Remote</p>
                </div>
                <span className="status">Saved</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-inner">
            <h2>Resume match</h2>
            <div className="score-ring">
              <strong>72%</strong>
            </div>
            <p className="muted">Most missing: TypeScript, Testing, Azure</p>
            <div className="keyword-pills">
              <span className="pill">React</span>
              <span className="pill">SQL</span>
              <span className="pill">Git</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
