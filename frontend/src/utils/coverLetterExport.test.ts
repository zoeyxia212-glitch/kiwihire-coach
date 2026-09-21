import { describe, expect, it } from "vitest";
import { coverLetterFilename } from "./coverLetterExport";

describe("coverLetterFilename", () => {
  it("creates a safe descriptive filename", () => {
    expect(coverLetterFilename("  Xero NZ  ", "Graduate Software Engineer"))
      .toBe("cover-letter-xero-nz-graduate-software-engineer.txt");
  });

  it("uses a fallback when a filename part has no safe characters", () => {
    expect(coverLetterFilename("招聘", "开发"))
      .toBe("cover-letter-application-application.txt");
  });
});
