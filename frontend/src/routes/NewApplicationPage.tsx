import ApplicationForm, {
  type ApplicationFormValues,
} from "../components/ApplicationForm";
import { createApplication } from "../utils/api";

export default function NewApplicationPage() {
  async function handleCreate(values: ApplicationFormValues) {
    await createApplication(values);

    window.location.href = "/applications";
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">New role</p>
          <h1>Save an application.</h1>
          <p className="muted">
            Add the job description now so the resume optimizer can use it
            later.
          </p>
        </div>
      </div>
      <ApplicationForm onSubmit={handleCreate} />
    </section>
  );
}
