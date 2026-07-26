import { useState } from "react";
import type { ApplicationStatus } from "../types/application";

export type ApplicationFormValues = {
  company: string;
  roleTitle: string;
  location: string;
  status: ApplicationStatus;
  jobDescription: string;
  closingDate: string;
  source: string;
  workMode: string;
  workRightsRequirement: string;
  salaryRange: string;
  contactPerson: string;
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
  const [source, setSource] = useState(initialValues?.source ?? "");
  const [workMode, setWorkMode] = useState(
    initialValues?.workMode ?? "",
  );
  const [workRightsRequirement, setWorkRightsRequirement] = useState(
    initialValues?.workRightsRequirement ?? "",
  );
  const [salaryRange, setSalaryRange] = useState(
    initialValues?.salaryRange ?? "",
  );
  const [contactPerson, setContactPerson] = useState(
    initialValues?.contactPerson ?? "",
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
      source,
      workMode,
      workRightsRequirement,
      salaryRange,
      contactPerson,
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
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
          >
            <option value="">Not recorded</option>
            <option value="SEEK">SEEK</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Company website">Company website</option>
            <option value="Referral">Referral</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="field">
          <label>Work mode</label>
          <select
            value={workMode}
            onChange={(event) => setWorkMode(event.target.value)}
          >
            <option value="">Not specified</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="field">
          <label>Work rights requirement</label>
          <input
            placeholder="NZ work rights required, sponsorship available..."
            value={workRightsRequirement}
            maxLength={200}
            onChange={(event) =>
              setWorkRightsRequirement(event.target.value)
            }
          />
        </div>

        <div className="field">
          <label>Salary range</label>
          <input
            placeholder="NZ$65,000–75,000"
            value={salaryRange}
            maxLength={120}
            onChange={(event) => setSalaryRange(event.target.value)}
          />
        </div>

        <div className="field">
          <label>Recruiter or contact person</label>
          <input
            placeholder="Name or email"
            value={contactPerson}
            maxLength={200}
            onChange={(event) => setContactPerson(event.target.value)}
          />
        </div>

        <div className="field">
          <label>Status</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
          >
            <option>Saved</option>
            <option>Applied</option>
            <option>Recruiter Screen</option>
            <option>First Interview</option>
            <option>Second Interview</option>
            <option>Technical Interview</option>
            <option>Reference Check</option>
            <option>Offer</option>
            <option>Rejected</option>
            <option>Withdrawn</option>
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
