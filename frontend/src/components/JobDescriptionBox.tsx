export default function JobDescriptionBox() {
  return (
    <div className="panel">
      <div className="panel-inner form-grid">
        <div className="field">
          <label>Application</label>
          <select>
            <option>Xero · Junior Software Developer</option>
            <option>Datacom · Graduate Developer</option>
          </select>
        </div>
        <div className="field">
          <label>Resume</label>
          <select>
            <option>Frontend resume</option>
            <option>Graduate resume</option>
          </select>
        </div>
        <button className="button primary" type="button">Analyze resume</button>
      </div>
    </div>
  );
}
