import { Link } from "react-router";

type ResourceNotFoundStateProps = {
  title: string;
  message: string;
  backTo: string;
  backLabel: string;
};

export default function ResourceNotFoundState({
  title,
  message,
  backTo,
  backLabel,
}: ResourceNotFoundStateProps) {
  return (
    <section className="page resource-not-found">
      <div className="panel">
        <div className="panel-inner">
          <p className="eyebrow">Record not found</p>
          <h1>{title}</h1>
          <p className="muted">{message}</p>
          <Link className="button primary" to={backTo}>
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
