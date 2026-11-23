import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS, scoreOffers, type Offer } from "./offerCompare";

const offer = (over: Partial<Offer>): Offer => ({
  id: "a",
  name: "A",
  salary: null,
  commute: null,
  growth: null,
  balance: null,
  visa: "unsure",
  ...over,
});

describe("scoreOffers", () => {
  it("scores salary against the best offer", () => {
    const [a, b] = scoreOffers(
      [offer({ id: "a", salary: 80000 }), offer({ id: "b", salary: 60000 })],
      { ...DEFAULT_WEIGHTS, commute: 0, growth: 0, balance: 0, visa: 0 },
    );
    expect(a.overall).toBe(100);
    expect(b.overall).toBe(75);
  });

  it("gives the shortest commute full marks", () => {
    const [a, b] = scoreOffers(
      [offer({ id: "a", commute: 20 }), offer({ id: "b", commute: 40 })],
      { salary: 0, commute: 1, growth: 0, balance: 0, visa: 0 },
    );
    expect(a.overall).toBe(100);
    expect(b.overall).toBe(50);
  });

  it("does not count a blank figure as zero", () => {
    const [a, b] = scoreOffers(
      [offer({ id: "a", salary: 70000, growth: 5 }), offer({ id: "b", growth: 5 })],
      DEFAULT_WEIGHTS,
    );
    expect(a.overall).toBe(100);
    expect(b.overall).toBe(100);
  });

  it("skips visa support when it is unsure and scores no as zero", () => {
    const [a, b] = scoreOffers(
      [offer({ id: "a", visa: "yes" }), offer({ id: "b", visa: "no" })],
      { salary: 0, commute: 0, growth: 0, balance: 0, visa: 1 },
    );
    expect(a.overall).toBe(100);
    expect(b.overall).toBe(0);
  });

  it("has no score when nothing can be compared", () => {
    expect(scoreOffers([offer({})], DEFAULT_WEIGHTS)[0].overall).toBeNull();
  });

  it("switches a criterion off with weight 0", () => {
    const [a] = scoreOffers(
      [offer({ salary: 50000, growth: 1 })],
      { salary: 0, commute: 0, growth: 1, balance: 0, visa: 0 },
    );
    expect(a.overall).toBe(0);
  });
});
