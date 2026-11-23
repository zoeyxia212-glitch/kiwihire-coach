/**
 * Where applications go: response, interview and offer counts by source and
 * by the resume that was submitted.
 *
 * Only the current status is known, not the path an application took, so
 * "responded" means "has moved past Applied" and an application that was
 * rejected after an interview counts as responded but not interviewed.
 * Small groups are labelled as small: with a handful of applications a
 * percentage says little, so nothing is called "best" below MIN_SAMPLE.
 */

export const MIN_SAMPLE = 5;

const INTERVIEW_STATUSES = new Set([
  "Recruiter Screen",
  "First Interview",
  "Second Interview",
  "Technical Interview",
  "Reference Check",
  "Offer",
]);

export type InsightApplication = {
  status: string;
  source: string | null;
  submittedResumeName?: string | null;
};

export type InsightRow = {
  label: string;
  submitted: number;
  responded: number;
  interviewed: number;
  offers: number;
  /** Responded divided by submitted, as a whole percent. */
  responseRate: number | null;
  smallSample: boolean;
};

export type Insights = {
  total: InsightRow;
  bySource: InsightRow[];
  byResume: InsightRow[];
  /** A plain sentence when one group clearly has enough data, else null. */
  headline: string | null;
};

function emptyRow(label: string): InsightRow {
  return {
    label,
    submitted: 0,
    responded: 0,
    interviewed: 0,
    offers: 0,
    responseRate: null,
    smallSample: true,
  };
}

function finish(row: InsightRow): InsightRow {
  return {
    ...row,
    responseRate:
      row.submitted === 0
        ? null
        : Math.round((row.responded / row.submitted) * 100),
    smallSample: row.submitted < MIN_SAMPLE,
  };
}

function group(
  applications: InsightApplication[],
  labelOf: (application: InsightApplication) => string,
): InsightRow[] {
  const rows = new Map<string, InsightRow>();

  for (const application of applications) {
    const label = labelOf(application);
    const row = rows.get(label) ?? emptyRow(label);
    row.submitted += 1;
    if (application.status !== "Applied" && application.status !== "Withdrawn") {
      row.responded += 1;
    }
    if (INTERVIEW_STATUSES.has(application.status)) {
      row.interviewed += 1;
    }
    if (application.status === "Offer") {
      row.offers += 1;
    }
    rows.set(label, row);
  }

  return [...rows.values()]
    .map(finish)
    .sort((a, b) => b.submitted - a.submitted || a.label.localeCompare(b.label));
}

function clean(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  return trimmed || "Not recorded";
}

export function buildInsights(applications: InsightApplication[]): Insights {
  // A role that is only Saved was never sent, so it is not an outcome yet.
  const sent = applications.filter((item) => item.status !== "Saved");
  const [total = finish(emptyRow("All applications"))] = group(
    sent,
    () => "All applications",
  );
  const bySource = group(sent, (item) => clean(item.source));
  const byResume = group(sent, (item) => clean(item.submittedResumeName));

  const comparable = bySource.filter(
    (row) => !row.smallSample && row.label !== "Not recorded",
  );
  let headline: string | null = null;
  if (comparable.length >= 2) {
    const best = [...comparable].sort(
      (a, b) => (b.responseRate ?? 0) - (a.responseRate ?? 0),
    )[0];
    const worst = [...comparable].sort(
      (a, b) => (a.responseRate ?? 0) - (b.responseRate ?? 0),
    )[0];
    if (best.label !== worst.label && best.responseRate !== worst.responseRate) {
      headline = `${best.label} has had the highest response rate (${best.responseRate}% of ${best.submitted}) and ${worst.label} the lowest (${worst.responseRate}% of ${worst.submitted}).`;
    }
  }

  return { total, bySource, byResume, headline };
}
