import type { Dashboard } from "../types/dashboard";

const NOTIFICATION_HISTORY_KEY =
  "kiwihire-browser-notification-history";

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
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const now = new Date();
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const todayKey = now.toISOString().slice(0, 10);
  const shownKeys = loadShownKeys();

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
  });

  localStorage.setItem(
    NOTIFICATION_HISTORY_KEY,
    JSON.stringify([...shownKeys].slice(-100)),
  );
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
