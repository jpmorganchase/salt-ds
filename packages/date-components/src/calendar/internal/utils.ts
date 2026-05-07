import type {
  DateFrameworkType,
  SaltDateAdapter,
  Timezone,
} from "@salt-ds/date-adapters";

export function daysOfWeek(
  dateAdapter: SaltDateAdapter,
  format: "long" | "short" | "narrow",
) {
  return Array.from({ length: 7 }, (_, day) =>
    dateAdapter.getDayOfWeekName(day, format),
  );
}

export function generateMonthsForYear(
  dateAdapter: SaltDateAdapter,
  currentYear: DateFrameworkType,
) {
  const startOfYear = dateAdapter.startOf(currentYear, "year");
  return Array.from({ length: 12 }, (_, month) =>
    dateAdapter.add(startOfYear, { months: month }),
  );
}

export function generateVisibleDays(
  dateAdapter: SaltDateAdapter,
  currentMonth: DateFrameworkType,
  timezone: Timezone,
) {
  const totalDays = 6 * 7;
  const startDate = dateAdapter.startOf(
    dateAdapter.startOf(currentMonth, "month"),
    "week",
  );
  return [...Array(totalDays).keys()].map((dayDelta) => {
    let day = dateAdapter.add(startDate, { days: dayDelta });
    day = dateAdapter.setTimezone(day, timezone);
    return day;
  });
}

export function monthDiff(
  dateAdapter: SaltDateAdapter,
  a: DateFrameworkType,
  b: DateFrameworkType,
) {
  const aMonth = dateAdapter.getMonth(a);
  const aYear = dateAdapter.getYear(a);
  const bMonth = dateAdapter.getMonth(b);
  const bYear = dateAdapter.getYear(b);

  return bMonth - aMonth + 12 * (bYear - aYear);
}

export function generateDatesForMonth(
  dateAdapter: SaltDateAdapter,
  date: DateFrameworkType,
): DateFrameworkType[] {
  const startDate = dateAdapter.startOf(date, "month");
  const endDate = dateAdapter.endOf(date, "month");
  const dates: DateFrameworkType[] = [];
  for (
    let currentDate = startDate;
    dateAdapter.compare(currentDate, endDate) <= 0;
    currentDate = dateAdapter.add(currentDate, { days: 1 })
  ) {
    dates.push(currentDate);
  }
  return dates;
}
