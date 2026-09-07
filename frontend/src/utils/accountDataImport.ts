import type { Application } from "../types/application";
import type { ApplicationAnswer } from "../types/applicationAnswer";
import type { ApplicationEvent } from "../types/applicationEvent";
import type { CandidateProfile } from "../types/candidateProfile";
import type { EvidenceItem } from "../types/evidenceItem";
import type { LearningGoal } from "../types/learningGoal";
import type { ProductFeedback } from "../types/productFeedback";
import type { Resume } from "../types/resume";
import type { ResumeReview } from "../types/resumeReview";
import { restoreAccountBackup } from "./api";

export type AccountBackupData = {
  profile: CandidateProfile;
  applications: Application[];
  timelines: { applicationId: number; events: ApplicationEvent[] }[];
  resumes: Resume[];
  reviews: ResumeReview[];
  evidence: EvidenceItem[];
  applicationAnswers: ApplicationAnswer[];
  learningGoals: LearningGoal[];
  feedback: ProductFeedback[];
};

export type AccountBackupPreview = {
  exportedAt: string;
  accountEmail: string;
  counts: {
    applications: number;
    timelineEvents: number;
    resumes: number;
    reviews: number;
    evidence: number;
    applicationAnswers: number;
    learningGoals: number;
    feedback: number;
  };
  data: AccountBackupData;
};

export async function inspectAccountDataBackup(
  file: File,
): Promise<AccountBackupPreview> {
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("The backup is larger than the 20 MB safety limit.");
  }

  let backup: unknown;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  if (!isRecord(backup)) {
    throw new Error("This file does not contain a KiwiHire backup object.");
  }
  if (backup.product !== "KiwiHire Coach") {
    throw new Error("This file was not exported by KiwiHire Coach.");
  }
  if (backup.schemaVersion !== 1) {
    throw new Error("This backup version is not supported.");
  }

  const requiredArrays = [
    "applications",
    "timelines",
    "resumes",
    "reviews",
    "evidence",
    "applicationAnswers",
    "learningGoals",
    "feedback",
  ] as const;
  for (const key of requiredArrays) {
    if (!Array.isArray(backup[key])) {
      throw new Error(`The backup is missing its ${key} collection.`);
    }
  }

  const applications = backup.applications as unknown[];
  const timelines = backup.timelines as unknown[];
  const resumes = backup.resumes as unknown[];
  const reviews = backup.reviews as unknown[];
  const evidence = backup.evidence as unknown[];
  const applicationAnswers = backup.applicationAnswers as unknown[];
  const learningGoals = backup.learningGoals as unknown[];
  const feedback = backup.feedback as unknown[];

  const account = isRecord(backup.account) ? backup.account : {};
  const timelineEvents = timelines.reduce<number>((total, timeline) => {
    if (!isRecord(timeline) || !Array.isArray(timeline.events)) return total;
    return total + timeline.events.length;
  }, 0);

  return {
    exportedAt: typeof backup.exportedAt === "string"
      ? backup.exportedAt
      : "Unknown date",
    accountEmail: typeof account.email === "string"
      ? account.email
      : "Unknown account",
    counts: {
      applications: applications.length,
      timelineEvents,
      resumes: resumes.length,
      reviews: reviews.length,
      evidence: evidence.length,
      applicationAnswers: applicationAnswers.length,
      learningGoals: learningGoals.length,
      feedback: feedback.length,
    },
    data: backup as unknown as AccountBackupData,
  };
}

export type RestoreResult = {
  applications: number;
  resumes: number;
  reviews: number;
  timelineEvents: number;
  restoredSubmissionSnapshots: number;
  skippedSubmissionSnapshots: number;
};

export async function restoreAccountDataBackup(
  backup: AccountBackupData,
): Promise<RestoreResult> {
  return restoreAccountBackup(backup);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
