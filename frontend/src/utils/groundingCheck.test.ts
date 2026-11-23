import { describe, expect, it } from "vitest";
import { findUnsupportedSkills } from "./groundingCheck";

describe("findUnsupportedSkills", () => {
  it("flags a technical skill that appears nowhere in the supporting text", () => {
    const result = findUnsupportedSkills(
      "I built services with Java and deployed them using Docker.",
      ["Built a Java REST service for the support team."],
    );

    expect(result).toEqual(["Docker"]);
  });

  it("accepts skills supported by any source", () => {
    const result = findUnsupportedSkills(
      "I used React and Git every day.",
      ["Resume: React dashboard", "Profile: Git, GitHub"],
    );

    expect(result).toEqual([]);
  });

  it("ignores soft skills that appear in almost any text", () => {
    const result = findUnsupportedSkills(
      "Strong communication and documentation habits.",
      [],
    );

    expect(result).toEqual([]);
  });

  it("does not confuse Java with JavaScript", () => {
    const result = findUnsupportedSkills("I write Java daily.", [
      "I write JavaScript daily.",
    ]);

    expect(result).toEqual(["Java"]);
  });
});
