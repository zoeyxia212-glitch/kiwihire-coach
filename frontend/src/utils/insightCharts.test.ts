import { describe, expect, it } from "vitest";
import { funnelBars, monthlyCounts } from "./insightCharts";

describe("insight charts", () => {
  it("lists the funnel steps in order", () => {
    const bars = funnelBars({
      label: "All applications",
      submitted: 10,
      responded: 6,
      interviewed: 3,
      offers: 1,
      responseRate: 60,
      smallSample: false,
    });
    expect(bars.map((bar) => bar.value)).toEqual([10, 6, 3, 1]);
  });

  it("counts applications per month and keeps empty months", () => {
    const now = new Date(2026, 10, 27);
    const bars = monthlyCounts(
      [
        { createdAt: new Date(2026, 10, 2).toISOString() },
        { createdAt: new Date(2026, 10, 20).toISOString() },
        { createdAt: new Date(2026, 8, 5).toISOString() },
        { createdAt: new Date(2025, 0, 1).toISOString() },
      ],
      now,
      3,
    );
    expect(bars.map((bar) => bar.value)).toEqual([1, 0, 2]);
  });
});
