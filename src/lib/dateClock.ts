export interface WeekStripDay {
  label: string;
  dayNum: number;
  isoDate: string;
}

export interface MonthGridCell {
  day: number;
  isoDate: string;
  inMonth: boolean;
  outside?: boolean;
}

const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatIsoDateLocal(d: Date): string {
  const yyyy = String(d.getFullYear()).padStart(4, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getTodayIsoDate(now: Date = new Date()): string {
  return formatIsoDateLocal(now);
}

export function getCurrentTime24(now: Date = new Date()): string {
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function parseIsoDateParts(isoDate: string): {
  year: number;
  monthIndex0: number;
  day: number;
} {
  const parts = isoDate.split("-").map(Number);
  const now = new Date();
  return {
    year: parts[0] || now.getFullYear(),
    monthIndex0: (parts[1] || now.getMonth() + 1) - 1,
    day: parts[2] || now.getDate(),
  };
}

export function addDaysIso(isoDate: string, days: number): string {
  const { year, monthIndex0, day } = parseIsoDateParts(isoDate);
  const dt = new Date(year, monthIndex0, day + days);
  return formatIsoDateLocal(dt);
}

export function formatLongDateHeading(isoDate: string): string {
  const { year, monthIndex0, day } = parseIsoDateParts(isoDate);
  const dt = new Date(year, monthIndex0, day);
  const weekday = WEEKDAYS_LONG[dt.getDay()] ?? "Monday";
  const month = MONTHS_LONG[dt.getMonth()] ?? "November";
  return `${weekday} ${dt.getDate()} ${month}`;
}

export function formatShortDateLabel(isoDate: string): string {
  const { year, monthIndex0, day } = parseIsoDateParts(isoDate);
  const dt = new Date(year, monthIndex0, day);
  const weekday = WEEKDAYS_SHORT[dt.getDay()] ?? "Mon";
  const month = MONTHS_SHORT[dt.getMonth()] ?? "Nov";
  return `${weekday} ${dt.getDate()} ${month}`;
}

export function formatMonthYearHeading(year: number, monthIndex0: number): string {
  const dt = new Date(year, monthIndex0, 1);
  const month = MONTHS_LONG[dt.getMonth()] ?? "November";
  return `${month} ${dt.getFullYear()}`;
}

export function shiftYearMonth(
  year: number,
  monthIndex0: number,
  deltaMonths: number,
): { year: number; monthIndex0: number } {
  const dt = new Date(year, monthIndex0 + deltaMonths, 1);
  return {
    year: dt.getFullYear(),
    monthIndex0: dt.getMonth(),
  };
}

/**
 * Returns the Monday–Sunday 7-day strip containing `isoDate`.
 */
export function buildWeekStripForDate(isoDate: string): WeekStripDay[] {
  const { year, monthIndex0, day } = parseIsoDateParts(isoDate);
  const dt = new Date(year, monthIndex0, day);
  const jsDay = dt.getDay(); // 0=Sun .. 6=Sat
  const offsetFromMonday = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(year, monthIndex0, day + offsetFromMonday);

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, idx) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
    return {
      label,
      dayNum: d.getDate(),
      isoDate: formatIsoDateLocal(d),
    };
  });
}

/**
 * Builds a 6-row Monday-first month grid for any (year, monthIndex0).
 */
export function buildMonthGrid(year: number, monthIndex0: number): MonthGridCell[][] {
  const firstOfMonth = new Date(year, monthIndex0, 1);
  const jsDay = firstOfMonth.getDay(); // 0=Sun .. 6=Sat
  const leadDays = jsDay === 0 ? 6 : jsDay - 1;
  const startCellDate = new Date(year, monthIndex0, 1 - leadDays);

  const weeks: MonthGridCell[][] = [];
  for (let weekIdx = 0; weekIdx < 6; weekIdx += 1) {
    const row: MonthGridCell[] = [];
    for (let dayIdx = 0; dayIdx < 7; dayIdx += 1) {
      const offset = weekIdx * 7 + dayIdx;
      const cellDate = new Date(
        startCellDate.getFullYear(),
        startCellDate.getMonth(),
        startCellDate.getDate() + offset,
      );
      const inMonth = cellDate.getMonth() === monthIndex0 && cellDate.getFullYear() === year;
      row.push({
        day: cellDate.getDate(),
        isoDate: formatIsoDateLocal(cellDate),
        inMonth,
        outside: !inMonth,
      });
    }
    weeks.push(row);
  }
  return weeks;
}
