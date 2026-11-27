import { useEffect, useState } from "react";
import ApplicationForm, {
  type ApplicationFormValues,
} from "../components/ApplicationForm";
import type { Application } from "../types/application";
import { createApplication, getApplications } from "../utils/api";

export default function NewApplicationPage() {
  const [existing, setExisting] = useState<Application[]>([]);

  useEffect(() => {
    // The warning is a convenience, so a failed load is silently ignored.
    getApplications().then(setExisting).catch(() => undefined);
  }, []);

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
      <ApplicationForm
        existingApplications={existing}
        onSubmit={handleCreate}
      />
    </section>
  );
}
