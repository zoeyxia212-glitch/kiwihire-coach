import { describe, expect, it } from "vitest";
import { checkEligibility } from "../utils/eligibilityGate";
import { sanitizeJobText } from "../utils/jobTextSanitizer";
import { findUnsupportedSkills } from "../utils/groundingCheck";
import {
  ELIGIBILITY_CASES,
  GROUNDING_CASES,
  SANITIZER_CASES,
} from "./evalCases";

describe("eligibility golden cases", () => {
  it.each(ELIGIBILITY_CASES)("$name", (testCase) => {
    const result = checkEligibility({
      jobDescription: testCase.jobDescription,
      candidateWorkRights: testCase.candidateWorkRights,
    });
    expect(result.verdict).toBe(testCase.expected);
  });
});

describe("sanitiser golden cases", () => {
  it.each(SANITIZER_CASES)("$name", (testCase) => {
    const result = sanitizeJobText(testCase.input);
    expect(result.hasWarnings).toBe(testCase.expectWarnings);
    if (testCase.expectInstructionLines !== undefined) {
      expect(result.instructionLines).toHaveLength(
        testCase.expectInstructionLines,
      );
    }
  });
});

describe("grounding golden cases", () => {
  it.each(GROUNDING_CASES)("$name", (testCase) => {
    expect(
      findUnsupportedSkills(testCase.text, testCase.supporting),
    ).toEqual(testCase.expectedUnsupported);
  });
});
