import { describe, expect, it } from "vitest";
import { buildVisaHints, VISA_LINKS } from "./visaHints";

describe("buildVisaHints", () => {
  it("gives citizens and residents nothing", () => {
    expect(
      buildVisaHints({ candidateWorkRights: "NZ citizen", sponsorshipAvailable: true }),
    ).toEqual([]);
  });

  it("asks for work rights when the profile has none", () => {
    const hints = buildVisaHints({ candidateWorkRights: "", sponsorshipAvailable: null });
    expect(hints).toHaveLength(1);
    expect(hints[0].links).toEqual([]);
  });

  it("points to the accredited employer pages when sponsorship is offered", () => {
    const hints = buildVisaHints({
      candidateWorkRights: "Student visa",
      sponsorshipAvailable: true,
    });
    expect(hints[0].links).toContain(VISA_LINKS.accreditedList);
  });

  it("warns when the employer does not sponsor", () => {
    const hints = buildVisaHints({
      candidateWorkRights: "Student visa",
      sponsorshipAvailable: false,
    });
    expect(hints[0].text).toContain("does not sponsor");
  });

  it("adds a post-study visa hint", () => {
    const hints = buildVisaHints({
      candidateWorkRights: "Post-study work visa",
      sponsorshipAvailable: null,
    });
    expect(hints[0].links).toContain(VISA_LINKS.postStudy);
    expect(hints).toHaveLength(2);
  });
});
