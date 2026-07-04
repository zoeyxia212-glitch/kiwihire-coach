export default function SuggestionList() {
  return (
    <div className="panel">
      <div className="panel-inner">
        <h2>Suggestions</h2>
        <div className="list">
          <div className="list-row">
            <div>
              <h3>Add TypeScript evidence</h3>
              <p>Mention one project where you used typed props, API types, or validation.</p>
            </div>
          </div>
          <div className="list-row">
            <div>
              <h3>Show testing experience</h3>
              <p>Add a bullet about Vitest, API testing, or component testing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
