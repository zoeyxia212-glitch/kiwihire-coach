import type { Application } from "../types/application";
import StatusBadge from "./StatusBadge";

type ApplicationCardProps = {
  application: Application;
};

export default function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <article className="list-row">
      <div>
        <h3>{application.company}</h3>
        <p>
  {application.roleTitle} · {application.userEmail}
  {application.closingDate && ` · Closes ${application.closingDate}`}
          </p>
      </div>
      <StatusBadge status={application.status} />
    </article>
  );
}