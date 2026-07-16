import ApplicationCard from "../components/ApplicationCard";
import type { Application } from "../types/application";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/api";
export default function ApplicationsPage() {
const [applications, setApplications] = useState<Application[]>([
  
]);
const userId = 1;
useEffect(() => {
fetch(`${API_BASE_URL}/api/applications/user/${userId}`)   
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
