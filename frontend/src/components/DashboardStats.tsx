type DashboardStatsProps = {
  totalApplications: number;
  interviewApplications: number;
  dueToday: number;
  overdue: number;
};

export default function DashboardStats({
  totalApplications,
  interviewApplications,
  dueToday,
  overdue,
}: DashboardStatsProps) {
  return (
    <div className="grid stats">
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">{totalApplications}</p>
          <p className="stat-label">Applications</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">{interviewApplications}</p>
          <p className="stat-label">Interviews</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">{dueToday}</p>
          <p className="stat-label">Due today</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-inner">
          <p className="stat-number">{overdue}</p>
          <p className="stat-label">Overdue</p>
        </div>
      </div>
    </div>
  );
}
