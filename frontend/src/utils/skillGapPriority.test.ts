import { describe, expect, it } from "vitest";
import {
  orderBySkillPriority,
  weightSkillGaps,
  type GapReview,
} from "./skillGapPriority";

const gap = (skill: string) => ({ skill, explanation: "" });

function review(
  applicationId: number,
  score: number | null,
  skills: string[],
  createdAt = "2026-11-01T10:00:00",
): GapReview {
  return {
    applicationId,
    score,
    missing: skills.map(gap),
    company: `Company ${applicationId}`,
    roleTitle: "Developer",
    createdAt,
  };
}

describe("weightSkillGaps", () => {
  it("weights each gap by how close the role is to a match", () => {
    const { gaps } = weightSkillGaps([
      review(1, 80, ["Docker"]),
      review(2, 20, ["Kubernetes"]),
    ]);

    expect(gaps.map((item) => item.skill)).toEqual(["Docker", "Kubernetes"]);
    expect(gaps[0].weight).toBe(0.8);
    expect(gaps[1].weight).toBe(0.2);
  });

  it("ranks a gap shared by several near-fit roles above a single one", () => {
    const { gaps } = weightSkillGaps([
      review(1, 70, ["Docker", "AWS"]),
      review(2, 70, ["Docker"]),
      review(3, 90, ["AWS"]),
    ]);

    // Docker: 0.7 + 0.7 = 1.4. AWS: 0.7 + 0.9 = 1.6.
    expect(gaps[0].skill).toBe("AWS");
    expect(gaps[0].roles).toBe(2);
  });

  it("counts only the latest review of each application", () => {
    const { gaps } = weightSkillGaps([
      review(1, 50, ["Docker"], "2026-10-01T10:00:00"),
      review(1, 90, ["Kubernetes"], "2026-11-01T10:00:00"),
    ]);

    expect(gaps.map((item) => item.skill)).toEqual(["Kubernetes"]);
  });

  it("skips unscored reviews instead of treating them as zero", () => {
    const result = weightSkillGaps([
      review(1, null, ["Docker"]),
      review(2, 60, ["AWS"]),
    ]);

    expect(result.skippedUnscored).toBe(1);
    expect(result.gaps.map((item) => item.skill)).toEqual(["AWS"]);
  });

  it("does not double count a skill repeated inside one review", () => {
    const { gaps } = weightSkillGaps([review(1, 80, ["Docker", "docker"])]);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].roles).toBe(1);
  });

  it("lists up to three example roles", () => {
    const { gaps } = weightSkillGaps(
      [1, 2, 3, 4].map((id) => review(id, 60, ["Docker"])),
    );

    expect(gaps[0].exampleRoles).toHaveLength(3);
    expect(gaps[0].roles).toBe(4);
  });
});

describe("orderBySkillPriority", () => {
  it("orders by weighted priority and leaves unknown skills last", () => {
    const { gaps } = weightSkillGaps([
      review(1, 90, ["AWS"]),
      review(2, 30, ["Docker"]),
    ]);
    const ordered = orderBySkillPriority(
      [{ skill: "Linux" }, { skill: "docker" }, { skill: "AWS" }],
      gaps,
    );

    expect(ordered.map((item) => item.skill)).toEqual([
      "AWS",
      "docker",
      "Linux",
    ]);
  });
});
