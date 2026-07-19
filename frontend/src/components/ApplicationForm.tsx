import { useState } from "react";
import type { ApplicationStatus } from "../types/application";

export type ApplicationFormValues = {
  company: string;
  roleTitle: string;
  location: string;
  status: ApplicationStatus;
  jobDescription: string;
  closingDate: string;
};
type ApplicationFormProps = {
  initialValues?: ApplicationFormValues;
  submitLabel?: string;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
};
export default function ApplicationForm({
  initialValues,
  submitLabel = "Save application",
  onSubmit,
}: ApplicationFormProps) {
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [roleTitle, setRoleTitle] = useState(
    initialValues?.roleTitle ?? "",
  );
  const [location, setLocation] = useState(
    initialValues?.location ?? "",
  );
  const [status, setStatus] = useState<ApplicationStatus>(
    initialValues?.status ?? "Saved",
  );
  const [jobDescription, setJobDescription] = useState(
    initialValues?.jobDescription ?? "",
  );
  const [closingDate, setClosingDate] = useState(
    initialValues?.closingDate ?? "",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company) {
      setErrorMessage("Please fill in company.");
      return;
    }

    if (!roleTitle) {
      setErrorMessage("Please fill in role title.");
      return;
    }

    if (!jobDescription) {
      setErrorMessage("Please fill in job description.");
      return;
    }

    if (!closingDate) {
      setErrorMessage("Please fill in closing date.");
      return;
    }

    setErrorMessage("");
    const formValues: ApplicationFormValues = {
      company,
      roleTitle,
      location,
      status,
      jobDescription,
      closingDate,
    };

    try {
      await onSubmit(formValues);
    } catch {
      setErrorMessage("Failed to save application. Please try again.");
    }
  }
  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-inner form-grid">
        <div className="field">
          <label>Company</label>
          <input
            placeholder="Xero"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>

        <div className="field">
          <label>Role title</label>
          <input
            placeholder="Junior Software Developer"
            value={roleTitle}
            onChange={(event) => setRoleTitle(event.target.value)}
          />
        </div>

        <div className="field">
          <label>Location</label>
          <input
            placeholder="Auckland"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>

        <div className="field">
          <label>Source</label>
          <select>
            <option>SEEK</option>
            <option>LinkedIn</option>
            <option>Company website</option>
            <option>Referral</option>
          </select>
        </div>

        <div className="field">
          <label>Status</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
          >
            <option>Saved</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Rejected</option>
            <option>Offer</option>
          </select>
        </div>

        <div className="field">
          <label>Closing date</label>
          <input
            type="date"
            value={closingDate}
            onChange={(event) => setClosingDate(event.target.value)}
          />
        </div>

        <div className="field">
          <label>Job description</label>
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button className="button primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
