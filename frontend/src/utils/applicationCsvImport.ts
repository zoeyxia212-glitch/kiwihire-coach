import type { ApplicationStatus } from "../types/application";
import type { CreateApplicationRequest } from "./api";
import {
  findDuplicateApplication,
  type DuplicateCandidate,
} from "./duplicateApplication";

const STATUSES: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Recruiter Screen",
  "First Interview",
  "Second Interview",
  "Technical Interview",
  "Reference Check",
  "Offer",
  "Rejected",
  "Withdrawn",
];

export const MAX_IMPORT_ROWS = 200;

export type CsvImportPreview = {
  /** Rows that can be created. */
  rows: CreateApplicationRequest[];
  /** Rows skipped because the application already exists or repeats in the file. */
  duplicates: number;
  /** Plain-language reasons for rows that cannot be imported. */
  problems: string[];
  /** Rows that had no closing date, so a placeholder was used. */
  placeholderClosingDates: number;
};

/** Splits CSV text into rows, handling quoted cells, doubled quotes and line breaks. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((items) => items.some((item) => item.trim() !== ""));
}

const HEADER_ALIASES: Record<string, string> = {
  company: "company",
  "role title": "roleTitle",
  role: "roleTitle",
  position: "roleTitle",
  "job title": "roleTitle",
  location: "location",
  status: "status",
  source: "source",
  "work mode": "workMode",
  "salary range": "salaryRange",
  "contact person": "contactPerson",
  "job url": "jobUrl",
  "closing date": "closingDate",
};

/** Our own export prefixes a quote to cells that start with = + - or @; undo that. */
function clean(value: string | undefined): string {
  const text = (value ?? "").trim();
  return /^'[=+\-@]/.test(text) ? text.slice(1) : text;
}

function placeholderClosingDate(now: Date): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function previewCsvImport(
  text: string,
  existing: DuplicateCandidate[],
  now = new Date(),
): CsvImportPreview {
  const table = parseCsv(text);
  const preview: CsvImportPreview = {
    rows: [],
    duplicates: 0,
    problems: [],
    placeholderClosingDates: 0,
  };
  if (table.length === 0) {
    preview.problems.push("The file is empty.");
    return preview;
  }

  const columns = new Map<string, number>();
  table[0].forEach((header, index) => {
    const field = HEADER_ALIASES[header.trim().toLowerCase()];
    if (field && !columns.has(field)) columns.set(field, index);
  });
  if (!columns.has("company") || !columns.has("roleTitle")) {
    preview.problems.push(
      'The first row needs "Company" and "Role title" columns.',
    );
    return preview;
  }

  const body = table.slice(1);
  if (body.length > MAX_IMPORT_ROWS) {
    preview.problems.push(
      `The file has ${body.length} rows. Import at most ${MAX_IMPORT_ROWS} at a time.`,
    );
    return preview;
  }

  const seen: DuplicateCandidate[] = [...existing];
  body.forEach((cells, rowIndex) => {
    const line = rowIndex + 2;
    const value = (field: string) =>
      clean(cells[columns.get(field) ?? -1]);
    const company = value("company");
    const roleTitle = value("roleTitle");
    if (!company || !roleTitle) {
      preview.problems.push(`Row ${line}: company and role title are required.`);
      return;
    }

    const rawStatus = value("status");
    const status = rawStatus
      ? STATUSES.find((item) => item.toLowerCase() === rawStatus.toLowerCase())
      : "Saved";
    if (!status) {
      preview.problems.push(`Row ${line}: "${rawStatus}" is not a known status.`);
      return;
    }

    let closingDate = value("closingDate");
    if (closingDate && !isIsoDate(closingDate)) {
      preview.problems.push(
        `Row ${line}: closing date must look like 2026-12-31.`,
      );
      return;
    }
    if (!closingDate) {
      closingDate = placeholderClosingDate(now);
      preview.placeholderClosingDates += 1;
    }

    const jobUrl = value("jobUrl");
    if (jobUrl && !isHttpUrl(jobUrl)) {
      preview.problems.push(`Row ${line}: job URL must start with http:// or https://.`);
      return;
    }

    if (findDuplicateApplication(seen, company, roleTitle)) {
      preview.duplicates += 1;
      return;
    }
    seen.push({ id: -1, company, roleTitle, status });

    preview.rows.push({
      company,
      roleTitle,
      location: value("location"),
      status,
      jobDescription: "Imported from a CSV file. Add the job description when you have it.",
      closingDate,
      source: value("source"),
      workMode: value("workMode"),
      workRightsRequirement: "",
      salaryRange: value("salaryRange"),
      contactPerson: value("contactPerson"),
      jobUrl,
    });
  });

  return preview;
}
