import { describe, expect, it } from "vitest";
import { parseCsv, previewCsvImport } from "./applicationCsvImport";

const NOW = new Date(2026, 10, 27);

describe("parseCsv", () => {
  it("handles quotes, commas and line breaks inside cells", () => {
    expect(parseCsv('a,"b, c","d ""q"""\r\n1,2,3\n')).toEqual([
      ["a", "b, c", 'd "q"'],
      ["1", "2", "3"],
    ]);
  });
});

describe("previewCsvImport", () => {
  it("imports valid rows and defaults a missing status to Saved", () => {
    const preview = previewCsvImport(
      "Company,Role title,Closing date\nXero,Graduate Developer,2026-12-31\n",
      [],
      NOW,
    );
    expect(preview.problems).toEqual([]);
    expect(preview.rows).toHaveLength(1);
    expect(preview.rows[0]).toMatchObject({
      company: "Xero",
      status: "Saved",
      closingDate: "2026-12-31",
    });
    expect(preview.placeholderClosingDates).toBe(0);
  });

  it("uses a placeholder closing date and counts it", () => {
    const preview = previewCsvImport("Company,Role\nXero,Dev\n", [], NOW);
    expect(preview.rows[0].closingDate).toBe("2026-12-27");
    expect(preview.placeholderClosingDates).toBe(1);
  });

  it("skips existing applications and repeats inside the file", () => {
    const preview = previewCsvImport(
      "Company,Role title\nXero,Dev\nTrade Me,Dev\ntrade me,dev\n",
      [{ id: 1, company: "Xero", roleTitle: "Dev", status: "Applied" }],
      NOW,
    );
    expect(preview.rows.map((row) => row.company)).toEqual(["Trade Me"]);
    expect(preview.duplicates).toBe(2);
  });

  it("reports unknown statuses, bad dates and missing columns", () => {
    expect(
      previewCsvImport("Company,Role title,Status\nA,B,Hired\n", [], NOW).problems[0],
    ).toContain("not a known status");
    expect(
      previewCsvImport("Company,Role title,Closing date\nA,B,31/12/2026\n", [], NOW).problems[0],
    ).toContain("closing date");
    expect(previewCsvImport("Name,Thing\nA,B\n", [], NOW).problems[0]).toContain(
      "Company",
    );
  });

  it("removes the spreadsheet-safety quote added by our own export", () => {
    const preview = previewCsvImport("Company,Role title\n'=Corp,Dev\n", [], NOW);
    expect(preview.rows[0].company).toBe("=Corp");
  });
});
