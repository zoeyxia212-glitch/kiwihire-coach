/**
 * Decides which applications need the user's attention, and why.
 *
 * Rules:
 *  - A saved role that was never submitted is never "quiet": nobody is late
 *    replying to something that was not sent. It is only urgent when its
 *    closing date is near, or has already passed (documents written, never
 *    sent, and now unsendable).
 *  - An open submitted application goes quiet after 10 days (time to follow
 *    up) and stale after 60 days (time to close it out).
 *  - Offers, rejections and withdrawals are finished and never need chasing.
 *
 * Idea adapted from the follow-up and stale-sweep rules in
 * MadsLorentzen/ai-job-search (MIT).
 */

export const FOLLOW_UP_AFTER_DAYS = 10;
export const STALE_AFTER_DAYS = 60;
export const CLOSING_SOON_DAYS = 7;

const CLOSED_STATUSES = new Set(["Offer", "Rejected", "Withdrawn"]);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type QuietKind =
  | "not-sent"
  | "closed"
  | "active"
  | "follow-up"
  | "stale";

export type QuietStatus = {
  kind: QuietKind;
  daysQuiet: number | null;
  label: string;
};

export function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY));
}

export function quietStatus(
  status: string,
  lastActivityAt: string,
  today: Date = new Date(),
): QuietStatus {
  if (status === "Saved") {
    return { kind: "not-sent", daysQuiet: null, label: "Not submitted yet" };
  }
  if (CLOSED_STATUSES.has(status)) {
    return { kind: "closed", daysQuiet: null, label: "Finished" };
  }

  const daysQuiet = daysBetween(new Date(lastActivityAt), today);

  if (daysQuiet >= STALE_AFTER_DAYS) {
    return {
      kind: "stale",
      daysQuiet,
      label: `Stale · ${daysQuiet} days quiet`,
    };
  }
  if (daysQuiet >= FOLLOW_UP_AFTER_DAYS) {
    return {
      kind: "follow-up",
      daysQuiet,
      label: `Follow up · ${daysQuiet} days quiet`,
    };
  }
  return { kind: "active", daysQuiet, label: `${daysQuiet} days quiet` };
}

export type ClosingUrgency = {
  kind: "missed" | "soon" | "none";
  daysUntilClosing: number | null;
  label: string;
};

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Closing-date urgency for a role that has not been submitted. */
export function closingUrgency(
  status: string,
  closingDate: string | null,
  today: Date = new Date(),
): ClosingUrgency {
  const none: ClosingUrgency = {
    kind: "none",
    daysUntilClosing: null,
    label: "",
  };

  if (status !== "Saved" || !closingDate) {
    return none;
  }
  const closing = parseLocalDate(closingDate);
  if (!closing) {
    return none;
  }

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const days = Math.round((closing.getTime() - todayStart.getTime()) / MS_PER_DAY);

  if (days < 0) {
    return {
      kind: "missed",
      daysUntilClosing: days,
      label: "Closing date passed and this role was never submitted",
    };
  }
  if (days <= CLOSING_SOON_DAYS) {
    return {
      kind: "soon",
      daysUntilClosing: days,
      label:
        days === 0
          ? "Closes today and is not submitted yet"
          : `Closes in ${days} day${days === 1 ? "" : "s"} and is not submitted yet`,
    };
  }
  return none;
}

type WithClosing = {
  status: string;
  closingDate: string | null;
  archived?: boolean;
};

/** Saved roles whose closing date has passed, oldest deadline first. */
export function findMissedDeadlines<T extends WithClosing>(
  applications: T[],
  today: Date = new Date(),
): T[] {
  return applications
    .filter((application) => !application.archived)
    .filter(
      (application) =>
        closingUrgency(application.status, application.closingDate, today)
          .kind === "missed",
    )
    .sort((first, second) =>
      (first.closingDate ?? "").localeCompare(second.closingDate ?? ""),
    );
}
