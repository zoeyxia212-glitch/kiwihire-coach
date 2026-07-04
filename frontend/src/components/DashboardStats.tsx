export default function DashboardStats() {
  return (
    <div className="grid stats">
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">18</p>
          <p className="stat-label">Applications</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">4</p>
          <p className="stat-label">Interviews</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">72%</p>
          <p className="stat-label">Avg. match</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">2</p>
          <p className="stat-label">Follow-ups</p>
        </div>
      </div>
    </div>
  );
}
