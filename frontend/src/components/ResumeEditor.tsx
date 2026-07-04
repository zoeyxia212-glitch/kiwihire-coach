export default function ResumeEditor() {
  return (
    <div className="panel">
      <div className="panel-inner form-grid">
        <div className="field">
          <label>Resume name</label>
          <input placeholder="Graduate developer resume" />
        </div>
        <div className="field">
          <label>Resume text</label>
          <textarea placeholder="Paste your resume text here..." />
        </div>
        <button className="button primary" type="button">Save resume</button>
      </div>
    </div>
  );
}
