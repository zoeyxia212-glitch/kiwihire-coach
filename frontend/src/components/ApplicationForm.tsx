import { useState } from "react";
import type { ApplicationStatus } from "../types/application";
import { API_BASE_URL } from "../utils/api";

export default function ApplicationForm() {
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Saved");
  const [jobDescription, setJobDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [closingDate, setClosingDate] = useState("");

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

    const response = await fetch(`${API_BASE_URL}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        company,
        roleTitle,
        location,
        status,
        jobDescription,
        closingDate,
      }),
    });

    if (!response.ok) {
      setErrorMessage("Failed to create application. Please try again.");
      return;
    }

    window.location.href = "/applications";
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
          Save application
        </button>
      </div>
    </form>
  );
}
