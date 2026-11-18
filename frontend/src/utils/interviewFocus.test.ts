import { describe, expect, it } from "vitest";
import {
  HR_PROMPTS,
  focusQuestionNumbers,
  questionCategory,
} from "./interviewFocus";
import { buildGapChallenges } from "./gapChallenges";

const questions = [
  { question: "Can you tell me about a project where you used React?" },
  { question: "Tell me about a time you handled an incident." },
  { question: "How would you learn SQL on the job?" },
];

describe("interviewFocus", () => {
  it("classifies questions", () => {
    expect(questionCategory(questions[0])).toBe("Technical");
    expect(questionCategory(questions[1])).toBe("Behavioural");
    expect(questionCategory(questions[2])).toBe("Situational");
  });

  it("focuses technical questions for a business round", () => {
    expect(focusQuestionNumbers(questions, "business")).toEqual([1]);
  });

  it("focuses behavioural and situational questions for an HR round", () => {
    expect(focusQuestionNumbers(questions, "hr")).toEqual([2, 3]);
  });

  it("offers HR prompts that ask for no company claims", () => {
    expect(HR_PROMPTS.length).toBeGreaterThanOrEqual(4);
  });
});

describe("buildGapChallenges", () => {
  const missing = [
    { skill: "Docker" },
    { skill: "Kubernetes" },
    { skill: "AWS" },
    { skill: "Azure" },
  ];

  it("limits by interview type", () => {
    expect(buildGapChallenges(missing, [], [], "business")).toHaveLength(3);
    expect(buildGapChallenges(missing, [], [], "hr")).toHaveLength(2);
  });

  it("skips a gap that already has a question", () => {
    const result = buildGapChallenges(
      missing,
      [],
      [{ relatedSkill: "Docker" }],
      "business",
    );
    expect(result.map((item) => item.skill)).not.toContain("Docker");
  });

  it("uses the closest transferable skill and never invents experience", () => {
    const [first] = buildGapChallenges(
      [{ skill: "Docker" }],
      [{ skill: "Linux" }],
      [],
      "business",
    );
    expect(first.answerFrame[1]).toContain("Linux");
    expect(first.answerFrame[0]).toContain("have not used Docker");
  });

  it("asks each skill once", () => {
    const result = buildGapChallenges(
      [{ skill: "Docker" }, { skill: "docker" }],
      [],
      [],
      "business",
    );
    expect(result).toHaveLength(1);
  });
});
