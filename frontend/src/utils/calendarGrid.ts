export type CalendarItem = {
  date: string; // YYYY-MM-DD or an ISO date-time; only the date part is used
  label: string;
  kind: string;
  applicationId: number;
};

export type CalendarCell = {
  date: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
  items: CalendarItem[];
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function key(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

/**
 * A month as full weeks starting on Monday. Items land on the day in their
 * date text, so no time zone conversion can move them to another day.
 */
export function buildMonthGrid(
  year: number,
  monthIndex: number,
  items: CalendarItem[],
): CalendarCell[][] {
  const byDate = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const day = item.date.slice(0, 10);
    byDate.set(day, [...(byDate.get(day) ?? []), item]);
  }

  const first = new Date(year, monthIndex, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;

  const cells: CalendarCell[] = [];
  for (let index = 0; index < cellCount; index += 1) {
    const date = new Date(year, monthIndex, 1 - mondayOffset + index);
    const dateKey = key(date.getFullYear(), date.getMonth(), date.getDate());
    cells.push({
      date: dateKey,
      day: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
      items: byDate.get(dateKey) ?? [],
    });
  }

  const weeks: CalendarCell[][] = [];
  for (let start = 0; start < cells.length; start += 7) {
    weeks.push(cells.slice(start, start + 7));
  }
  return weeks;
}
