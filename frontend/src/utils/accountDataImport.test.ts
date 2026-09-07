import { describe, expect, it } from "vitest";
import { inspectAccountDataBackup } from "./accountDataImport";

function backupFile(value: unknown): File {
  return {
    size: 100,
    text: async () => typeof value === "string"
      ? value
      : JSON.stringify(value),
  } as File;
}

describe("inspectAccountDataBackup", () => {
  it("summarises a valid KiwiHire backup before restore", async () => {
    const preview = await inspectAccountDataBackup(backupFile({
      product: "KiwiHire Coach",
      schemaVersion: 1,
      exportedAt: "2026-09-05T07:00:00Z",
      account: { email: "zoey@example.com" },
      profile: {},
      applications: [{ id: 1 }],
      timelines: [{ applicationId: 1, events: [{ id: 2 }] }],
      resumes: [],
      reviews: [],
      evidence: [],
      applicationAnswers: [],
      learningGoals: [],
      feedback: [],
    }));

    expect(preview.accountEmail).toBe("zoey@example.com");
    expect(preview.counts.applications).toBe(1);
    expect(preview.counts.timelineEvents).toBe(1);
  });

  it("rejects text that is not valid JSON", async () => {
    await expect(inspectAccountDataBackup(backupFile("not-json")))
      .rejects.toThrow("This file is not valid JSON.");
  });

  it("rejects a JSON file from another product", async () => {
    await expect(inspectAccountDataBackup(backupFile({
      product: "Another App",
      schemaVersion: 1,
    }))).rejects.toThrow("This file was not exported by KiwiHire Coach.");
  });
});
