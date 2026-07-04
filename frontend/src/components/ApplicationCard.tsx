import StatusBadge from "./StatusBadge";

export default function ApplicationCard() {
  return (
    <article className="list-row">
      <div>
        <h3>Trade Me</h3>
        <p>Junior Full Stack Developer · Wellington · SEEK</p>
      </div>
      <StatusBadge status="Applied" />
    </article>
  );
}
