import { describe, expect, it } from "vitest";
import {
  closingUrgency,
  findMissedDeadlines,
  quietStatus,
} from "./applicationAttention";

const TODAY = new Date(2026, 10, 18, 12, 0, 0); // 18 Nov 2026, local

function daysAgo(days: number) {
  const date = new Date(TODAY.getTime() - days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

describe("quietStatus", () => {
  it("never calls a saved, unsubmitted role quiet", () => {
    const result = quietStatus("Saved", daysAgo(200), TODAY);

    expect(result.kind).toBe("not-sent");
    expect(result.daysQuiet).toBeNull();
  });

  it("ignores finished applications", () => {
    for (const status of ["Offer", "Rejected", "Withdrawn"]) {
      expect(quietStatus(status, daysAgo(200), TODAY).kind).toBe("closed");
    }
  });

  it("keeps recent activity active", () => {
    expect(quietStatus("Applied", daysAgo(9), TODAY).kind).toBe("active");
  });

  it("suggests a follow-up from 10 days", () => {
    const result = quietStatus("Applied", daysAgo(10), TODAY);

    expect(result.kind).toBe("follow-up");
    expect(result.label).toMatch(/Follow up/);
  });

  it("marks an application stale from 60 days", () => {
    expect(quietStatus("First Interview", daysAgo(59), TODAY).kind).toBe(
      "follow-up",
    );
    expect(quietStatus("First Interview", daysAgo(60), TODAY).kind).toBe(
      "stale",
    );
  });
});

describe("closingUrgency", () => {
  it("flags a passed deadline on a role that was never submitted", () => {
    const result = closingUrgency("Saved", "2026-11-10", TODAY);

    expect(result.kind).toBe("missed");
    expect(result.daysUntilClosing).toBe(-8);
  });

  it("flags a deadline within 7 days", () => {
    expect(closingUrgency("Saved", "2026-11-18", TODAY).label).toMatch(
      /Closes today/,
    );
    expect(closingUrgency("Saved", "2026-11-19", TODAY).label).toMatch(
      /Closes in 1 day and/,
    );
    expect(closingUrgency("Saved", "2026-11-25", TODAY).kind).toBe("soon");
    expect(closingUrgency("Saved", "2026-11-26", TODAY).kind).toBe("none");
  });

  it("only applies to roles that were not submitted", () => {
    expect(closingUrgency("Applied", "2026-11-10", TODAY).kind).toBe("none");
  });

  it("ignores a missing or malformed date", () => {
    expect(closingUrgency("Saved", null, TODAY).kind).toBe("none");
    expect(closingUrgency("Saved", "next week", TODAY).kind).toBe("none");
  });
});

describe("findMissedDeadlines", () => {
  it("lists missed roles, oldest deadline first, skipping archived ones", () => {
    const applications = [
      { id: 1, status: "Saved", closingDate: "2026-11-12" },
      { id: 2, status: "Saved", closingDate: "2026-11-05" },
      { id: 3, status: "Applied", closingDate: "2026-11-01" },
      { id: 4, status: "Saved", closingDate: "2026-11-01", archived: true },
      { id: 5, status: "Saved", closingDate: "2026-12-01" },
    ];

    expect(findMissedDeadlines(applications, TODAY).map((a) => a.id)).toEqual([
      2, 1,
    ]);
  });
});
