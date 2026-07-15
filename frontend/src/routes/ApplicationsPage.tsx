import ApplicationCard from "../components/ApplicationCard";
import type { Application } from "../types/application";
import { useEffect, useState } from "react";

export default function ApplicationsPage() {
const [applications, setApplications] = useState<Application[]>([
  
]);
useEffect(() => {
  fetch("http://localhost:8080/api/applications/user/1")
    .then((response) => response.json())
    .then((data) => {
      setApplications(data);
    });
}, []);
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1>Applications</h1>
          <p className="muted">Keep every role, deadline, and next step in one place.</p>
        </div>
        <a className="button primary" href="/applications/new">New application</a>
      </div>
      <div className="panel">
        <div className="panel-inner list">
{applications.map((application) => (
  <ApplicationCard key={application.id} application={application} />
))}
        </div>
      </div>
    </section>
  );
}
