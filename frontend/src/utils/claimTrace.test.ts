import { describe, expect, it } from "vitest";
import { traceClaims } from "./claimTrace";

const sources = [
  { label: "Submitted resume", text: "Built dashboards with React and TypeScript." },
  { label: "Evidence: Booking API", text: "Designed a REST API using Spring Boot and PostgreSQL." },
];

describe("traceClaims", () => {
  it("names the sources behind a supported claim", () => {
    const [claim] = traceClaims("I built the front end with React.", sources);

    expect(claim.supported).toBe(true);
    expect(claim.skills).toEqual([
      { skill: "React", sources: ["Submitted resume"] },
    ]);
  });

  it("lists several sources for one skill", () => {
    const [claim] = traceClaims("I know PostgreSQL well.", [
      ...sources,
      { label: "Profile", text: "PostgreSQL, SQL" },
    ]);

    expect(claim.skills[0].sources).toEqual([
      "Evidence: Booking API",
      "Profile",
    ]);
  });

  it("marks a claim with no source as unsupported", () => {
    const [claim] = traceClaims("I run workloads on Kubernetes.", sources);

    expect(claim.supported).toBe(false);
    expect(claim.skills[0].sources).toEqual([]);
  });

  it("is unsupported when any one skill in the sentence has no source", () => {
    const [claim] = traceClaims("I used React and Kubernetes together.", sources);

    expect(claim.supported).toBe(false);
  });

  it("skips sentences that name no tracked skill", () => {
    expect(traceClaims("I am keen to learn. I work well in teams.", sources))
      .toEqual([]);
  });
});
