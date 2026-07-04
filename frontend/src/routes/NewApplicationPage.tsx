import ApplicationForm from "../components/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">New role</p>
          <h1>Save an application.</h1>
          <p className="muted">Add the job description now so the resume optimizer can use it later.</p>
        </div>
      </div>
      <ApplicationForm />
    </section>
  );
}
