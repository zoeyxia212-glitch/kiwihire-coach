import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getApplications, getDashboard } from "../utils/api";
import { buildMonthGrid, type CalendarItem } from "../utils/calendarGrid";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [items, setItems] = useState<CalendarItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getApplications(), getDashboard()])
      .then(([applications, dashboard]) => {
        const closing: CalendarItem[] = applications
          .filter((item) => !item.archived && item.closingDate)
          .map((item) => ({
            date: item.closingDate as string,
            label: `${item.company} closes`,
            kind: "Closing date",
            applicationId: item.id,
          }));
        const reminders: CalendarItem[] = dashboard.upcomingReminders
          .filter((item) => item.type !== "Closing date")
          .map((item) => ({
            date: item.dueAt,
            label: `${item.company}: ${item.title}`,
            kind: item.type,
            applicationId: item.applicationId,
          }));
        const followUps: CalendarItem[] = dashboard.followUps.map((item) => ({
          date: item.followUpDueDate,
          label: `${item.company}: ${item.nextAction || "Follow up"}`,
          kind: "Follow-up",
          applicationId: item.applicationId,
        }));
        setItems([...closing, ...reminders, ...followUps]);
      })
      .catch(() => setError("The calendar could not be loaded."));
  }, []);

  function shift(delta: number) {
    const next = new Date(year, monthIndex + delta, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  }

  if (error) return <p className="error-message">{error}</p>;
  if (!items) return <p className="muted">Loading calendar...</p>;

  const weeks = buildMonthGrid(year, monthIndex, items);
  const title = new Date(year, monthIndex, 1).toLocaleString("en-NZ", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>{title}</h1>
          <p className="muted">
            Closing dates, interviews and follow-ups.{" "}
            <Link to="/applications">Back to applications</Link>
          </p>
        </div>
        <div className="segmented-control">
          <button type="button" onClick={() => shift(-1)}>
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              setYear(today.getFullYear());
              setMonthIndex(today.getMonth());
            }}
          >
            Today
          </button>
          <button type="button" onClick={() => shift(1)}>
            Next
          </button>
        </div>
      </div>
      <div className="calendar-grid" role="grid" aria-label={title}>
        {WEEKDAYS.map((day) => (
          <div className="calendar-weekday" key={day} role="columnheader">
            {day}
          </div>
        ))}
        {weeks.flat().map((cell) => (
          <div
            className={`calendar-cell${cell.inMonth ? "" : " is-outside"}`}
            key={cell.date}
            role="gridcell"
          >
            <span className="calendar-day">{cell.day}</span>
            {cell.items.map((item, index) => (
              <Link
                className="calendar-item"
                key={`${item.kind}-${item.applicationId}-${index}`}
                to={`/applications/${item.applicationId}`}
                title={`${item.kind}: ${item.label}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
