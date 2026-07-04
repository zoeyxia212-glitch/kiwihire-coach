export default function ApplicationForm() {
  return (
    <form className="panel">
      <div className="panel-inner form-grid">
        <div className="field">
          <label>Company</label>
          <input placeholder="Xero" />
        </div>
        <div className="field">
          <label>Role title</label>
          <input placeholder="Junior Software Developer" />
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
          <select>
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
          <textarea placeholder="Paste the job description here..." />
        </div>
        <button className="button primary" type="button">Save application</button>
      </div>
    </form>
  );
}
