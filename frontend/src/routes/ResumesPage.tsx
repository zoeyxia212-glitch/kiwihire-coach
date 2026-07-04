import ResumeEditor from "../components/ResumeEditor";

export default function ResumesPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Resume library</p>
          <h1>Keep versions simple.</h1>
          <p className="muted">Save different resume versions for frontend, backend, and graduate roles.</p>
        </div>
      </div>
      <ResumeEditor />
    </section>
  );
}
