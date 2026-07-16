import { useState } from "react";
import type { ApplicationStatus } from "../types/application";
import { API_BASE_URL } from "../utils/api";

export default function ApplicationForm() {
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Saved");
  const [jobDescription, setJobDescription] = useState("");
async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();


  const response = await fetch(`${API_BASE_URL}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: 1,
      company: company,
      roleTitle: roleTitle,
      status: status,
      jobDescription: jobDescription,
    }),
  });
   if (!response.ok) {
    console.error("Failed to create application");
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
          <input placeholder="Auckland" />
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
          <input type="date" />
        </div>

        <div className="field">
          <label>Job description</label>
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
        </div>

        <button className="button primary" type="submit">
          Save application
        </button>
      </div>
    </form>
  );
}
