import ApplicationCard from "../components/ApplicationCard";

export default function ApplicationsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1>Applications</h1>
          <p className="muted">Keep every role, deadline, and next step in one place.</p>
        </div>
        <a className="button primary" href="/applications/new">New application</a>
      </div>
      <div className="panel">
        <div className="panel-inner list">
          <ApplicationCard />
          <article className="list-row">
            <div>
              <h3>Serko</h3>
              <p>Graduate Engineer · Auckland · LinkedIn</p>
            </div>
            <span className="status">Saved</span>
          </article>
          <article className="list-row">
            <div>
              <h3>Sharesies</h3>
              <p>Frontend Developer · Wellington · Company website</p>
            </div>
            <span className="status">Interview</span>
          </article>
        </div>
      </div>
    </section>
  );
}
