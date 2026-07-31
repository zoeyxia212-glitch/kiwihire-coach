import { useEffect } from "react";
import { getDashboard } from "../utils/api";
import {
  getBrowserNotificationsEnabled,
  showDashboardNotifications,
} from "../utils/browserNotifications";

const REMINDER_CHECK_INTERVAL_MS = 15 * 60 * 1000;

export default function BrowserReminderMonitor() {
  useEffect(() => {
    async function checkReminders() {
      if (!getBrowserNotificationsEnabled()) {
        return;
      }

      try {
        showDashboardNotifications(await getDashboard());
      } catch {
        // The visible pages handle API and authentication errors.
        // Reminder checks stay silent so they do not interrupt the user.
      }
    }

    checkReminders();
    const intervalId = window.setInterval(
      checkReminders,
      REMINDER_CHECK_INTERVAL_MS,
    );

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
