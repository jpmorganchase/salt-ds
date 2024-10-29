import type { DateFrameworkType, SaltDateAdapter } from "../../date-adapters";

export function daysOfWeek<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  format: "long" | "short" | "narrow",
  locale?: any,
) {
  return Array.from({ length: 7 }, (_, day) =>
    dateAdapter.getDayOfWeekName(day, format, locale),
  );
}

export function generateMonthsForYear<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  currentYear: TDate,
) {
  const startOfYear = dateAdapter.startOf(currentYear, "year");
  return Array.from({ length: 12 }, (_, month) =>
    dateAdapter.add(startOfYear, { months: month }),
  );
}

export function generateVisibleDays<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  currentMonth: TDate,
  locale?: any,
) {
  const totalDays = 6 * 7;
  const startDate = dateAdapter.startOf(
    dateAdapter.startOf(currentMonth, "month", locale),
    "week",
    locale,
  );
  return [...Array(totalDays).keys()].map((dayDelta) => {
    const day = dateAdapter.add(startDate, { days: dayDelta });
    return {
      date: day,
      dateOfMonth: dateAdapter.getMonth(day),
      isCurrentMonth: dateAdapter.isSame(day, currentMonth, "month"),
    };
  });
}

export function monthDiff<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  a: TDate,
  b: TDate,
) {
  const aMonth = dateAdapter.getMonth(a);
  const aYear = dateAdapter.getYear(a);
  const bMonth = dateAdapter.getMonth(b);
  const bYear = dateAdapter.getYear(b);

  return bMonth - aMonth + 12 * (bYear - aYear);
}

export function generateDatesForMonth<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  date: TDate,
): TDate[] {
  const startDate = dateAdapter.startOf(date, "month");
  const endDate = dateAdapter.endOf(date, "month");
  const dates: TDate[] = [];
  for (
    let currentDate = startDate;
    dateAdapter.compare(currentDate, endDate) <= 0;
    currentDate = dateAdapter.add(currentDate, { days: 1 })
  ) {
    dates.push(currentDate);
  }
  return dates;
}
