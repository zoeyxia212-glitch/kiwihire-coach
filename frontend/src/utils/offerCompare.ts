/**
 * Compares job offers on the things the person says matter to them.
 *
 * Each criterion is scored 0 to 100 within the offers being compared, and
 * the overall score is the weighted average. A criterion left blank for an
 * offer is skipped for that offer and the weights are rebalanced, so a
 * missing figure never counts as zero. Weights of 0 switch a criterion off.
 * The scores only order the offers by the person's own priorities: they do
 * not say which offer is right.
 */

export type VisaSupport = "yes" | "no" | "unsure";

export type Offer = {
  id: string;
  name: string;
  /** Annual salary in NZD. */
  salary: number | null;
  /** Minutes each way. */
  commute: number | null;
  /** 1 to 5. */
  growth: number | null;
  /** 1 to 5. */
  balance: number | null;
  visa: VisaSupport;
};

export type CriterionKey = "salary" | "commute" | "growth" | "balance" | "visa";

export type Weights = Record<CriterionKey, number>;

export const DEFAULT_WEIGHTS: Weights = {
  salary: 3,
  commute: 2,
  growth: 3,
  balance: 2,
  visa: 3,
};

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  salary: "Salary",
  commute: "Commute",
  growth: "Growth",
  balance: "Work life balance",
  visa: "Visa support",
};

export type OfferScore = {
  offer: Offer;
  overall: number | null;
  parts: Partial<Record<CriterionKey, number>>;
};

function rating(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  const clamped = Math.min(5, Math.max(1, value));
  return ((clamped - 1) / 4) * 100;
}

export function scoreOffers(offers: Offer[], weights: Weights): OfferScore[] {
  const salaries = offers
    .map((offer) => offer.salary)
    .filter((value): value is number => value !== null && value > 0);
  const commutes = offers
    .map((offer) => offer.commute)
    .filter((value): value is number => value !== null && value >= 0);
  const topSalary = salaries.length ? Math.max(...salaries) : null;
  const shortest = commutes.length ? Math.min(...commutes) : null;

  return offers.map((offer) => {
    const parts: Partial<Record<CriterionKey, number>> = {};

    if (offer.salary !== null && offer.salary > 0 && topSalary) {
      parts.salary = (offer.salary / topSalary) * 100;
    }
    if (offer.commute !== null && offer.commute >= 0 && shortest !== null) {
      // The shortest commute scores 100. Zero minutes (remote) always does.
      parts.commute =
        offer.commute === 0 ? 100 : Math.min(100, (shortest / offer.commute) * 100 || 100);
    }
    const growth = rating(offer.growth);
    if (growth !== null) parts.growth = growth;
    const balance = rating(offer.balance);
    if (balance !== null) parts.balance = balance;
    if (offer.visa === "yes") parts.visa = 100;
    if (offer.visa === "no") parts.visa = 0;

    let weighted = 0;
    let totalWeight = 0;
    (Object.keys(parts) as CriterionKey[]).forEach((key) => {
      const weight = weights[key];
      if (weight > 0) {
        weighted += (parts[key] as number) * weight;
        totalWeight += weight;
      }
    });

    return {
      offer,
      overall: totalWeight > 0 ? Math.round(weighted / totalWeight) : null,
      parts,
    };
  });
}
