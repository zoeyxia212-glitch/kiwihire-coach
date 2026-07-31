import type { Dashboard } from "../types/dashboard";

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

export function showDashboardNotifications(dashboard: Dashboard) {
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
      followUp.applicationId,
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
      reminder.applicationId,
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
  applicationId: number,
) {
  const notification = new Notification(title, {
    body,
    tag: `application-${applicationId}-${title}`,
  });

  notification.onclick = () => {
    window.focus();
    window.location.assign(`/applications/${applicationId}`);
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
