import { describe, expect, it } from "vitest";
import { parseDocumentFile } from "./documentFileParser";

function textFile(
  name: string,
  content: string,
  size = content.length,
): File {
  return {
    name,
    size,
    text: async () => content,
  } as File;
}

describe("parseDocumentFile", () => {
  it("extracts and normalises text from a TXT file", async () => {
    const result = await parseDocumentFile(
      textFile("Zoey CV.txt", "Java   \n\n\nSpring Boot\u0000\n"),
    );

    expect(result).toEqual({
      suggestedName: "Zoey CV",
      text: "Java\n\nSpring Boot",
    });
  });

  it("rejects unsupported file types", async () => {
    await expect(parseDocumentFile(textFile("resume.pages", "content")))
      .rejects.toThrow("Choose a PDF, DOCX, or TXT file.");
  });

  it("rejects files larger than 10 MB", async () => {
    await expect(
      parseDocumentFile(textFile("resume.txt", "content", 10 * 1024 * 1024 + 1)),
    ).rejects.toThrow("File must be smaller than 10 MB.");
  });

  it("rejects files that contain no readable text", async () => {
    await expect(parseDocumentFile(textFile("empty.txt", " \n\n\u0000")))
      .rejects.toThrow("No readable text was found.");
  });
});
