import { describe, expect, it } from "vitest";
import { findDuplicateApplication } from "./duplicateApplication";

const existing = [
  { id: 1, company: "Xero", roleTitle: "Graduate Developer", status: "Applied" },
  { id: 2, company: "Trade Me", roleTitle: "Junior Developer", status: "Saved", archived: true },
];

describe("findDuplicateApplication", () => {
  it("matches ignoring case and extra spaces", () => {
    expect(
      findDuplicateApplication(existing, "  xero ", "graduate   developer")?.id,
    ).toBe(1);
  });

  it("does not match a different role at the same company", () => {
    expect(findDuplicateApplication(existing, "Xero", "Data Analyst")).toBeNull();
  });

  it("ignores archived applications", () => {
    expect(findDuplicateApplication(existing, "Trade Me", "Junior Developer")).toBeNull();
  });

  it("stays quiet until both fields have text", () => {
    expect(findDuplicateApplication(existing, "Xero", "")).toBeNull();
    expect(findDuplicateApplication(existing, "", "Graduate Developer")).toBeNull();
  });
});
