import type { DashboardReminder } from "../types/dashboard";

export function downloadReminderCalendar(
  reminders: DashboardReminder[],
) {
  const calendarLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KiwiHire Coach//Job Search Reminders//EN",
    "CALSCALE:GREGORIAN",
    ...reminders.flatMap(calendarEventLines),
    "END:VCALENDAR",
  ];
  const calendar = calendarLines.join("\r\n");
  const blob = new Blob([calendar], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "kiwihire-reminders.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function calendarEventLines(
  reminder: DashboardReminder,
  index: number,
) {
  const start = new Date(reminder.dueAt);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const timestamp = formatCalendarDate(new Date());
  const uid = [
    reminder.type,
    reminder.applicationId,
    start.getTime(),
    index,
    "kiwihire",
  ].join("-");

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatCalendarDate(start)}`,
    `DTEND:${formatCalendarDate(end)}`,
    `SUMMARY:${escapeCalendarText(`${reminder.type}: ${reminder.company} · ${reminder.roleTitle}`)}`,
    `DESCRIPTION:${escapeCalendarText(reminder.title)}`,
    `URL:${window.location.origin}/applications/${reminder.applicationId}`,
    "END:VEVENT",
  ];
}

function formatCalendarDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeCalendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
