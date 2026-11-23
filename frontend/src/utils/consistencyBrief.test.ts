import { describe, expect, it } from "vitest";
import { buildConsistencyBrief } from "./consistencyBrief";

const resume = [
  "Built a React dashboard used by 40 engineers.",
  "Reduced incident response time by 30%.",
  "Wrote documentation for the support team.",
  "Studied at the University of Auckland from 2019 to 2021.",
].join("\n");

describe("buildConsistencyBrief", () => {
  it("includes evidence for requirements and sentences with numbers", () => {
    const brief = buildConsistencyBrief(
      [
        {
          skill: "React",
          evidence: "Built a React dashboard used by 40 engineers.",
          explanation: "",
        },
      ],
      resume,
    );
    const claims = brief.map((item) => item.claim);

    expect(claims).toContain("Built a React dashboard used by 40 engineers.");
    expect(claims).toContain("Reduced incident response time by 30%.");
  });

  it("merges reasons when one sentence is both", () => {
    const brief = buildConsistencyBrief(
      [
        {
          skill: "React",
          evidence: "Built a React dashboard used by 40 engineers.",
          explanation: "",
        },
      ],
      resume,
    );

    expect(brief[0].claim).toBe("Built a React dashboard used by 40 engineers.");
    expect(brief[0].reasons).toEqual(["requirement", "number"]);
    expect(brief[0].skills).toEqual(["React"]);
  });

  it("does not treat years or plain sentences as numeric claims", () => {
    const claims = buildConsistencyBrief([], resume).map((item) => item.claim);

    expect(claims).not.toContain("Wrote documentation for the support team.");
    expect(claims).not.toContain(
      "Studied at the University of Auckland from 2019 to 2021.",
    );
  });

  it("limits the list", () => {
    const many = Array.from(
      { length: 20 },
      (_, index) => `Handled ${index + 10}% more tickets each month.`,
    ).join("\n");

    expect(buildConsistencyBrief([], many, 5)).toHaveLength(5);
  });
});
