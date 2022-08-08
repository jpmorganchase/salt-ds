import {
  createCalendar,
  DateFormatter,
  DateValue,
  getLocalTimeZone,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  startOfYear,
  today,
} from "@internationalized/date";

const localTimezone = getLocalTimeZone();

export function getCurrentLocale() {
  return navigator.languages[0];
}

export function getDateFormatter(options?: Intl.DateTimeFormatOptions) {
  return new DateFormatter(getCurrentLocale(), options);
}

export function formatDate(
  date: DateValue,
  options?: Intl.DateTimeFormatOptions
) {
  const formatter = getDateFormatter(options);
  return formatter.format(date.toDate(localTimezone));
}

export function getCalender() {
  const calendarIdentifier = getDateFormatter().resolvedOptions().calendar;
  return createCalendar(calendarIdentifier);
}

type WeekdayFormat = Intl.DateTimeFormatOptions["weekday"];

export function daysForLocale(weekday: WeekdayFormat = "long") {
  return [...Array(7).keys()].map((day) =>
    formatDate(
      startOfWeek(today(getLocalTimeZone()), getCurrentLocale()).add({
        days: day,
      }),
      { weekday }
    )
  );
}

export function monthsForLocale(currentYear: DateValue) {
  const calendar = getCalender();
  return [...Array(calendar.getMonthsInYear(currentYear)).keys()].map((month) =>
    startOfYear(currentYear).add({ months: month })
  );
}

function mapDate(currentDate: DateValue, currentMonth: DateValue) {
  return {
    date: currentDate,
    dateOfMonth: currentDate.month,
    isCurrentMonth: isSameMonth(currentDate, currentMonth),
  };
}

export function generateVisibleDays(currentMonth: DateValue) {
  const totalDays = 6 * 7;
  const currentLocale = getCurrentLocale();
  const startDate = startOfWeek(startOfMonth(currentMonth), currentLocale);

  return [...Array(totalDays).keys()].map((dayDelta) => {
    const day = startDate.add({ days: dayDelta });
    return mapDate(day, currentMonth);
  });
}

export function monthDiff(a: DateValue, b: DateValue) {
  return b.month - a.month + 12 * (b.year - a.year);
}
