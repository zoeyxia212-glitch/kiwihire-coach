import type { InsightRow } from "./insights";

export type BarDatum = { label: string; value: number };

/** The four funnel steps, in order, from a total row. */
export function funnelBars(total: InsightRow): BarDatum[] {
  return [
    { label: "Sent", value: total.submitted },
    { label: "Responded", value: total.responded },
    { label: "Interview", value: total.interviewed },
    { label: "Offer", value: total.offers },
  ];
}

/**
 * Applications created per calendar month for the last `months` months,
 * oldest first, including months with none so gaps stay visible.
 */
export function monthlyCounts(
  applications: { createdAt: string }[],
  now: Date,
  months = 6,
): BarDatum[] {
  const buckets: BarDatum[] = [];
  const keys: string[] = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    keys.push(`${date.getFullYear()}-${date.getMonth()}`);
    buckets.push({
      label: date.toLocaleString("en-NZ", { month: "short" }),
      value: 0,
    });
  }
  for (const application of applications) {
    const created = new Date(application.createdAt);
    const index = keys.indexOf(`${created.getFullYear()}-${created.getMonth()}`);
    if (index >= 0) buckets[index].value += 1;
  }
  return buckets;
}
