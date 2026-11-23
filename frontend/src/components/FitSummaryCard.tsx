import type { EligibilityVerdict } from "../utils/eligibilityGate";
import { BAND_LABELS, type FitSummary } from "../utils/fitSummary";

type FitSummaryCardProps = {
  summary: FitSummary;
};

const GATE_LABELS: Record<EligibilityVerdict, string> = {
  fail: "Not eligible",
  pass: "Eligible",
  unverified: "Not confirmed",
  "not-needed": "Not applicable",
  unknown: "Not checked",
};

export default function FitSummaryCard({ summary }: FitSummaryCardProps) {
  const { gate, languages, dimensions, location } = summary;

  return (
    <div className="panel fit-summary">
      <div className="panel-inner">
        <p className="eyebrow">Fit summary</p>

        <div className="fit-summary-header">
          {summary.scored && summary.band && summary.overall !== null ? (
            <>
              <strong className="fit-summary-score">{summary.overall}</strong>
              <div>
                <h2>{BAND_LABELS[summary.band]}</h2>
                <p>{summary.advice}</p>
              </div>
            </>
          ) : (
            <div>
              <h2>Not scored</h2>
              <p>{summary.advice}</p>
            </div>
          )}
        </div>

        <div className={`fit-summary-gate fit-summary-gate-${gate.verdict}`}>
          <p>
            <strong>Work rights: {GATE_LABELS[gate.verdict]}.</strong>{" "}
            {gate.headline}
          </p>
          {gate.quote && (
            <blockquote>
              <span className="muted">From the posting:</span> {gate.quote}
            </blockquote>
          )}
          {gate.notes.map((note) => (
            <p className="muted" key={note}>
              {note}
            </p>
          ))}
        </div>

        {languages.length > 0 && (
          <div className="fit-summary-languages">
            <p>
              <strong>Language requirements.</strong> Checked against the
              languages on your profile. Terms like "fluent" vary a lot
              between employers, so judge the wording yourself.
            </p>
            <ul>
              {languages.map((requirement) => (
                <li key={requirement.language}>
                  <strong>{requirement.language}</strong>
                  {requirement.optional ? " (a bonus)" : ""}
                  {requirement.demanding ? ", fluent or native level" : ""}{" "}
                  <em>
                    {requirement.status === "listed"
                      ? "(on your profile)"
                      : requirement.status === "not-listed"
                        ? "(not on your profile)"
                        : "(no languages saved on your profile)"}
                  </em>
                  :{" "}
                  <span className="muted">{requirement.quote}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <table className="fit-summary-table">
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Weight</th>
              <th>Score</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dimension) => (
              <tr key={dimension.key}>
                <td>{dimension.label}</td>
                <td>{dimension.weight}%</td>
                <td>
                  {dimension.score === null ? "Not enough data" : dimension.score}
                </td>
                <td className="muted">{dimension.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {location && (
          <p className={location.status === "mismatch" ? "fit-summary-flag" : "muted"}>
            Location: {location.text}
          </p>
        )}

        <p className="muted">
          This is a guide built from rules you can read, not a prediction.
          Dimensions without data are left out, not counted as zero.
          Genuine gaps stay visible as gaps: add a keyword to your resume
          only if you can back it with a real example.
        </p>
      </div>
    </div>
  );
}
