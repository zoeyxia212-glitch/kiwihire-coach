import { describe, expect, it } from "vitest";
import {
  collectPriorFeedback,
  practiseFirst,
  rankQuestionPriorities,
} from "./questionPriority";

const questions = [
  { relatedSkill: "React" },
  { relatedSkill: "JavaScript / TypeScript" },
  { relatedSkill: "Database" },
  { relatedSkill: "Operations / Support" },
  { relatedSkill: "General" },
];

describe("rankQuestionPriorities", () => {
  it("puts earlier feedback ahead of gaps and requirements", () => {
    const result = rankQuestionPriorities(questions, {
      feedbackTexts: ["Struggled to explain React state clearly"],
      missingSkills: ["React", "TypeScript"],
      jobDescription: "React and TypeScript role",
    });

    expect(result[0].kind).toBe("feedback");
    // TypeScript is a gap, and the feedback did not mention it.
    expect(result[1].kind).toBe("gap");
  });

  it("marks gaps, then posting requirements, then general", () => {
    const result = rankQuestionPriorities(questions, {
      feedbackTexts: [],
      missingSkills: ["PostgreSQL"],
      jobDescription: "You will provide support to clients.",
    });

    expect(result[2].kind).toBe("gap"); // Database matches the PostgreSQL gap
    expect(result[3].kind).toBe("requirement"); // "support" is in the posting
    expect(result[4].kind).toBe("general");
    expect(result[0].kind).toBe("general"); // React is not mentioned anywhere
  });

  it("does not match a skill inside another word", () => {
    const result = rankQuestionPriorities([{ relatedSkill: "Java" }], {
      feedbackTexts: [],
      missingSkills: [],
      jobDescription: "Strong JavaScript skills",
    });

    expect(result[0].kind).toBe("general");
  });

  it("returns one priority per question, in order", () => {
    const result = rankQuestionPriorities(questions, {
      feedbackTexts: [],
      missingSkills: [],
      jobDescription: "",
    });

    expect(result).toHaveLength(questions.length);
  });
});

describe("practiseFirst", () => {
  it("lists 1-based numbers for feedback and gap questions only", () => {
    const result = rankQuestionPriorities(questions, {
      feedbackTexts: ["react"],
      missingSkills: ["sql"],
      jobDescription: "support role",
    });

    expect(practiseFirst(result)).toEqual([1, 3]);
  });
});

describe("collectPriorFeedback", () => {
  it("collects non-empty notes for the chosen application only", () => {
    const reviews = [
      {
        applicationId: 1,
        mockInterviewSessions: [
          { improvementNotes: " Explain React state " },
          { improvementNotes: "   " },
        ],
      },
      {
        applicationId: 2,
        mockInterviewSessions: [{ improvementNotes: "Other role" }],
      },
    ];

    expect(collectPriorFeedback(reviews, 1)).toEqual(["Explain React state"]);
  });
});
