import { describe, expect, it } from "vitest";
import { generateInterviewQuestions } from "./interviewQuestionGenerator";

describe("generateInterviewQuestions", () => {
  it("generates a React project question when job and resume both mention React", () => {
    const result = generateInterviewQuestions(
      "We are looking for a React developer.",
      "I built a React project."
    );

    expect(result.some((item) => item.id === "react-project-question")).toBe(true);
  });

  it("generates a React learning question when job mentions React but resume does not", () => {
    const result = generateInterviewQuestions(
      "This role needs React experience.",
      "I have built projects with HTML and CSS."
    );

    expect(result.some((item) => item.id === "react-learning-question")).toBe(true);
  });

  it("generates a general question when no keyword matches", () => {
    const result = generateInterviewQuestions(
      "We are looking for a motivated junior developer.",
      "I have customer service and study experience."
    );

    expect(result.some((item) => item.id === "general-question")).toBe(true);
  });
  it("generates a database learning question when job mentions SQL but resume does not", () => {
    const result = generateInterviewQuestions(
      "This role needs SQL and database knowledge.",
      "I have frontend project experience with React."
    );

    expect(result.some((item) => item.id === "database-learning-question")).toBe(true);
  });
    it("generates a JavaScript or TypeScript question when both sides mention it", () => {
    const result = generateInterviewQuestions(
      "We need JavaScript and TypeScript experience.",
      "I used TypeScript in a frontend project."
    );

    expect(result.some((item) => item.id === "js-ts-project-question")).toBe(true);
  });

});