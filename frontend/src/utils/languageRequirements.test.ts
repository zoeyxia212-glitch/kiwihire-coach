import { describe, expect, it } from "vitest";
import {
  checkLanguages,
  failedLanguage,
  findLanguageRequirements,
} from "./languageRequirements";

describe("findLanguageRequirements", () => {
  it("finds a demanding requirement and quotes the sentence", () => {
    const result = findLanguageRequirements(
      "Support our clients. Fluent Mandarin is required for this role.",
    );

    expect(result).toHaveLength(1);
    expect(result[0].language).toBe("Mandarin");
    expect(result[0].demanding).toBe(true);
    expect(result[0].optional).toBe(false);
    expect(result[0].quote).toBe("Fluent Mandarin is required for this role.");
  });

  it("marks a bonus language as optional", () => {
    const result = findLanguageRequirements(
      "Te reo Māori proficiency is an advantage.",
    );

    expect(result[0].language).toBe("Te Reo Māori");
    expect(result[0].optional).toBe(true);
  });

  it("ignores plain English mentions but reports a fluent-English bar", () => {
    expect(
      findLanguageRequirements("Speak with customers in English."),
    ).toEqual([]);

    const demanding = findLanguageRequirements(
      "Fluent English, written and spoken, is essential.",
    );
    expect(demanding[0].language).toBe("English");
    expect(demanding[0].demanding).toBe(true);
  });

  it("reports nothing when no language is required", () => {
    expect(
      findLanguageRequirements("Build React features with the team."),
    ).toEqual([]);
  });

  it("does not match a language inside another word", () => {
    expect(
      findLanguageRequirements("Strong speaking skills; German-made tools."),
    ).toEqual([]);
  });
});

describe("checkLanguages", () => {
  const demandingMandarin = findLanguageRequirements(
    "You must be fluent in Mandarin.",
  );
  const bonusMandarin = findLanguageRequirements(
    "Mandarin speaking is an advantage.",
  );

  it("is unchecked when the profile lists no languages", () => {
    expect(checkLanguages(demandingMandarin, "")[0].status).toBe("unchecked");
    expect(failedLanguage(checkLanguages(demandingMandarin, ""))).toBeUndefined();
  });

  it("marks a listed language as met", () => {
    expect(
      checkLanguages(demandingMandarin, "English, Mandarin")[0].status,
    ).toBe("listed");
  });

  it("treats Chinese as met by Mandarin and the reverse", () => {
    const chinese = findLanguageRequirements("Fluent Chinese is required.");
    expect(checkLanguages(chinese, "English and Mandarin")[0].status).toBe(
      "listed",
    );
    expect(checkLanguages(demandingMandarin, "Chinese")[0].status).toBe(
      "listed",
    );
  });

  it("fails only a demanding, non-optional language that is not listed", () => {
    const hard = findLanguageRequirements("You must be fluent in Japanese.");
    expect(failedLanguage(checkLanguages(hard, "English"))?.language).toBe(
      "Japanese",
    );
    expect(
      failedLanguage(
        checkLanguages(
          findLanguageRequirements("Japanese is an advantage."),
          "English",
        ),
      ),
    ).toBeUndefined();
    expect(failedLanguage(checkLanguages(bonusMandarin, "English"))).toBeUndefined();
  });
});
