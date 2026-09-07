import type { Dashboard } from "../types/dashboard";
import type { LearningGoal } from "../types/learningGoal";

const NOTIFICATION_HISTORY_KEY =
  "kiwihire-browser-notification-history";
const NOTIFICATION_PREFERENCE_KEY =
  "kiwihire-browser-notifications-enabled";

export function getBrowserNotificationsEnabled() {
  return localStorage.getItem(NOTIFICATION_PREFERENCE_KEY) === "true";
}

export function setBrowserNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(
    NOTIFICATION_PREFERENCE_KEY,
    String(enabled),
  );
}

export function getBrowserNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  return "Notification" in window
    ? Notification.permission
    : "unsupported";
}

export async function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported" as const;
  }

  return Notification.requestPermission();
}

export function showDashboardNotifications(
  dashboard: Dashboard,
  learningGoals: LearningGoal[] = [],
) {
  if (
    !getBrowserNotificationsEnabled() ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return 0;
  }

  const now = new Date();
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const todayKey = localDateKey(now);
  const shownKeys = loadShownKeys();
  let notificationCount = 0;

  dashboard.followUps.forEach((followUp) => {
    const key = `${todayKey}-follow-up-${followUp.eventId}`;

    if (shownKeys.has(key)) {
      return;
    }

    showNotification(
      followUp.overdue ? "Overdue follow-up" : "Follow-up due today",
      `${followUp.company} · ${followUp.roleTitle}: ${followUp.nextAction || "Follow up"}`,
      `/applications/${followUp.applicationId}`,
    );
    shownKeys.add(key);
    notificationCount += 1;
  });

  dashboard.upcomingReminders.forEach((reminder) => {
    const dueAt = new Date(reminder.dueAt);
    const key = `${todayKey}-${reminder.type}-${reminder.applicationId}-${reminder.dueAt}`;

    if (dueAt < now || dueAt > nextDay || shownKeys.has(key)) {
      return;
    }

    showNotification(
      `${reminder.type} coming up`,
      `${reminder.company} · ${reminder.roleTitle}: ${reminder.title}`,
      `/applications/${reminder.applicationId}`,
    );
    shownKeys.add(key);
    notificationCount += 1;
  });

  learningGoals.forEach((goal) => {
    if (
      goal.status === "Completed"
      || !goal.targetDate
      || goal.targetDate > todayKey
    ) {
      return;
    }

    const key = `${todayKey}-learning-goal-${goal.id}`;
    if (shownKeys.has(key)) {
      return;
    }

    showNotification(
      goal.targetDate < todayKey
        ? "Learning goal overdue"
        : "Learning goal due today",
      `${goal.skill}: ${goal.nextAction || "Choose your next practical action"}`,
      "/learning",
    );
    shownKeys.add(key);
    notificationCount += 1;
  });

  localStorage.setItem(
    NOTIFICATION_HISTORY_KEY,
    JSON.stringify([...shownKeys].slice(-100)),
  );

  return notificationCount;
}

export function showTestBrowserNotification() {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return false;
  }

  const notification = new Notification(
    "KiwiHire reminders are working",
    {
      body: "You will receive local alerts while KiwiHire Coach is open.",
      tag: "kiwihire-notification-test",
    },
  );
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  return true;
}

function showNotification(
  title: string,
  body: string,
  destination: string,
) {
  const notification = new Notification(title, {
    body,
    tag: `kiwihire-${destination}-${title}`,
  });

  notification.onclick = () => {
    window.focus();
    window.location.assign(destination);
    notification.close();
  };
}

function loadShownKeys() {
  try {
    const stored = localStorage.getItem(NOTIFICATION_HISTORY_KEY);
    const keys = stored ? JSON.parse(stored) : [];
    return new Set<string>(Array.isArray(keys) ? keys : []);
  } catch {
    return new Set<string>();
  }
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
