import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import type { Application } from "../types/application";


type ApplicationCardProps = {
  application: Application;
};

export default function ApplicationCard({ application }: ApplicationCardProps) {
  return (
<Link className="list-row" to={`/applications/${application.id}`}>
     <div>
        <h3>{application.company}</h3>
        <p>
          {application.roleTitle}
          {application.location && ` · ${application.location}`}
          {` · ${application.userEmail}`}
          {application.closingDate && ` · Closes ${application.closingDate}`}
        </p>
      </div>
      <StatusBadge status={application.status} />
    </Link>
  );
}
