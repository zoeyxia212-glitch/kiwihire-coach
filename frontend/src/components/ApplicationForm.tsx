import { useState } from "react";
import type { ApplicationStatus } from "../types/application";
import { parseDocumentFile } from "../utils/documentFileParser";

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
  jobUrl: string;
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
  const [jobUrl, setJobUrl] = useState(
    initialValues?.jobUrl ?? "",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isParsingJobFile, setIsParsingJobFile] = useState(false);
  const [jobFileMessage, setJobFileMessage] = useState("");

  async function handleJobFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      jobDescription.trim() &&
      !window.confirm(
        "Replace the current job description with text from this file?",
      )
    ) {
      return;
    }

    setIsParsingJobFile(true);
    setErrorMessage("");
    setJobFileMessage("");

    try {
      const parsedFile = await parseDocumentFile(file);
      setJobDescription(parsedFile.text);
      setJobFileMessage(
        `Extracted ${parsedFile.text.length.toLocaleString()} characters from ${file.name}. Review the text before saving.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The job description file could not be read.",
      );
    } finally {
      setIsParsingJobFile(false);
    }
  }

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
      jobUrl,
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
          <label>Original job URL</label>
          <input
            type="url"
            placeholder="https://www.seek.co.nz/job/..."
            value={jobUrl}
            maxLength={2000}
            onChange={(event) => setJobUrl(event.target.value)}
          />
          <span className="field-help">
            SEEK, LinkedIn, or the employer&apos;s careers page.
          </span>
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
          <div className="document-upload">
            <div>
              <strong>Import job description</strong>
              <span>
                PDF, DOCX, or TXT · Maximum 10 MB · Processed locally
              </span>
            </div>
            <label className="button compact" htmlFor="job-file">
              {isParsingJobFile ? "Reading file..." : "Choose file"}
            </label>
            <input
              id="job-file"
              className="visually-hidden"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              disabled={isParsingJobFile}
              onChange={handleJobFileChange}
            />
          </div>
          {jobFileMessage && (
            <p className="info-message" role="status">
              {jobFileMessage}
            </p>
          )}
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
