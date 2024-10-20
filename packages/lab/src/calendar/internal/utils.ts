import {
  type CalendarDate,
  DateFormatter,
  type DateValue,
  createCalendar,
  endOfMonth,
  getLocalTimeZone,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
  today,
} from "@internationalized/date";
import { getCurrentLocale } from "../formatDate";

export function formatDate(
  date: DateValue,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const timeLocale = locale || getCurrentLocale();
  const timeZone = options?.timeZone || getLocalTimeZone();
  const formatter = new DateFormatter(timeLocale, options);
  return formatter.format(date.toDate(timeZone));
}

export function getCalendar(locale: string) {
  const calendarIdentifier = new DateFormatter(locale).resolvedOptions()
    .calendar;
  return createCalendar(calendarIdentifier);
}

type WeekdayFormat = Intl.DateTimeFormatOptions["weekday"];

export function daysForLocale(weekday: WeekdayFormat, locale: string) {
  return [...Array(7).keys()].map((day) =>
    formatDate(
      startOfWeek(today(getLocalTimeZone()), locale).add({
        days: day,
      }),
      locale,
      { weekday: weekday || "long" },
    ),
  );
}

export function monthsForLocale(currentYear: DateValue, locale: string) {
  const calendar = getCalendar(locale);
  return [...Array(calendar.getMonthsInYear(currentYear)).keys()].map((month) =>
    startOfYear(currentYear).add({ months: month }),
  );
}

function mapDate(currentDate: DateValue, currentMonth: DateValue) {
  return {
    date: currentDate,
    dateOfMonth: currentDate.month,
    isCurrentMonth: isSameMonth(currentDate, currentMonth),
  };
}

export function generateVisibleDays(currentMonth: DateValue, locale: string) {
  const totalDays = 6 * 7;
  const startDate = startOfWeek(startOfMonth(currentMonth), locale);

  return [...Array(totalDays).keys()].map((dayDelta) => {
    const day = startDate.add({ days: dayDelta });
    return mapDate(day, currentMonth);
  });
}

export function monthDiff(a: DateValue, b: DateValue) {
  return b.month - a.month + 12 * (b.year - a.year);
}

export function generateDatesForMonth(date: DateValue): CalendarDate[] {
  const calendarDate = toCalendarDate(date);
  const startDate = startOfMonth(calendarDate);
  const endDate = endOfMonth(calendarDate);
  const dates = [];
  for (
    let currentDate = startDate;
    currentDate.compare(endDate) <= 0;
    currentDate = currentDate.add({ days: 1 })
  ) {
    dates.push(currentDate);
  }
  return dates;
}
