import ApplicationForm, {
  type ApplicationFormValues,
} from "../components/ApplicationForm";
import { API_BASE_URL } from "../utils/api";

export default function NewApplicationPage() {
  async function handleCreate(values: ApplicationFormValues) {
    const response = await fetch(`${API_BASE_URL}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        ...values,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create application.");
    }

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
