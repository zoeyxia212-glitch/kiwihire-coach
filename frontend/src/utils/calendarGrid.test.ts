import { describe, expect, it } from "vitest";
import { buildMonthGrid } from "./calendarGrid";

describe("buildMonthGrid", () => {
  it("builds full weeks starting on Monday", () => {
    const weeks = buildMonthGrid(2026, 10, []); // November 2026 starts on a Sunday
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0][0].date).toBe("2026-10-26");
    expect(weeks[0][6].date).toBe("2026-11-01");
    expect(weeks[0][6].inMonth).toBe(true);
    expect(weeks[0][0].inMonth).toBe(false);
  });

  it("places items on the day in their date text", () => {
    const weeks = buildMonthGrid(2026, 10, [
      { date: "2026-11-27T09:00:00", label: "Xero", kind: "Interview", applicationId: 1 },
    ]);
    const cell = weeks.flat().find((item) => item.date === "2026-11-27");
    expect(cell?.items).toHaveLength(1);
  });
});
