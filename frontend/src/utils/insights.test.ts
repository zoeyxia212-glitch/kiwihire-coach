import { describe, expect, it } from "vitest";
import { buildInsights, MIN_SAMPLE } from "./insights";

const app = (status: string, source: string | null, resume: string | null = null) => ({
  status,
  source,
  submittedResumeName: resume,
});

describe("buildInsights", () => {
  it("ignores roles that were only saved", () => {
    const result = buildInsights([app("Saved", "Seek"), app("Applied", "Seek")]);
    expect(result.total.submitted).toBe(1);
  });

  it("counts a status past Applied as a response", () => {
    const result = buildInsights([
      app("Applied", "Seek"),
      app("Rejected", "Seek"),
      app("First Interview", "Seek"),
      app("Offer", "Seek"),
    ]);
    const seek = result.bySource[0];
    expect(seek.submitted).toBe(4);
    expect(seek.responded).toBe(3);
    expect(seek.interviewed).toBe(2);
    expect(seek.offers).toBe(1);
    expect(seek.responseRate).toBe(75);
  });

  it("does not count a withdrawn application as a response", () => {
    const result = buildInsights([app("Withdrawn", "Seek")]);
    expect(result.total.responded).toBe(0);
  });

  it("groups by source and by resume, with a label for blanks", () => {
    const result = buildInsights([
      app("Applied", "Seek", "Backend CV"),
      app("Applied", "LinkedIn", "Backend CV"),
      app("Applied", null, null),
    ]);
    expect(result.bySource.map((row) => row.label).sort()).toEqual([
      "LinkedIn",
      "Not recorded",
      "Seek",
    ]);
    expect(result.byResume[0]).toMatchObject({ label: "Backend CV", submitted: 2 });
  });

  it("marks small groups and gives no headline for them", () => {
    const result = buildInsights([
      app("Offer", "Seek"),
      app("Applied", "LinkedIn"),
    ]);
    expect(result.bySource.every((row) => row.smallSample)).toBe(true);
    expect(result.headline).toBeNull();
  });

  it("names the best and worst source once both have enough data", () => {
    const many = (status: string, source: string, count: number) =>
      Array.from({ length: count }, () => app(status, source));
    const result = buildInsights([
      ...many("First Interview", "Referral", MIN_SAMPLE),
      ...many("Applied", "Seek", MIN_SAMPLE),
    ]);
    expect(result.headline).toContain("Referral");
    expect(result.headline).toContain("Seek");
  });
});
