import {
  CalendarDate,
  CalendarDateTime,
  type DateValue,
  type TimeFields,
  ZonedDateTime,
  getLocalTimeZone,
  toZoned,
} from "@internationalized/date";
import {
  type DateRangeSelection,
  type SingleDateSelection,
  getCurrentLocale,
} from "../calendar";

export type RangeTimeFields = {
  startTime?: TimeFields;
  endTime?: TimeFields;
};

/**
 * Parses a string into a CalendarDate.
 * @param inputDate - The input date string.
 * @returns An object containing the parsed date and any error encountered.
 */
export function getMonthNames(locale: string): { [key: string]: number } {
  const monthNames: { [key: string]: number } = {};
  const date = new Date(2000, 0, 1);
  for (let i = 0; i < 12; i++) {
    date.setMonth(i);
    const monthName = new Intl.DateTimeFormat(locale, {
      month: "short",
    }).format(date);
    monthNames[monthName] = i + 1;
  }
  return monthNames;
}

export function parseCalendarDate(
  inputDate: string,
  locale: string = getCurrentLocale(),
): {
  date: DateValue | null;
  error: string | false;
} {
  if (!inputDate?.length) {
    return { date: null, error: false };
  }

  const monthNames = getMonthNames(locale);

  // Combined regular expression to match DD MMM YYYY and DD MM YYYY formats. MM can have an optional 0 prefix
  const combinedDateRegex = /^(\d{1,2})[ \/-](\w{3,4}|\d{1,2})[ \/-](\d{4})$/;

  const match = inputDate.match(combinedDateRegex);

  if (!match) {
    return { date: null, error: "not a valid date format" };
  }

  const dayStr = match[1];
  const monthStr = match[2];
  const yearStr = match[3];

  if (!/^\d{1,2}$/.test(dayStr)) {
    return { date: null, error: "not a valid date" };
  }

  if (!/^\d{4}$/.test(yearStr)) {
    return { date: null, error: "not a valid year" };
  }

  const day = Number.parseInt(dayStr, 10);
  const year = Number.parseInt(yearStr, 10);

  if (isNaN(day) || day < 1 || day > 31) {
    return { date: null, error: "not a valid date" };
  }

  if (isNaN(year)) {
    return { date: null, error: "not a valid year" };
  }

  let month;
  if (isNaN(Number.parseInt(monthStr, 10))) {
    // Month is a word, in MMM or MMMM format
    month = monthNames[monthStr];
    if (!month) {
      return { date: null, error: "not a valid month name for locale" };
    }
  } else {
    // Month is numeric, in MM or M format
    month = Number.parseInt(monthStr, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      return { date: null, error: "not a valid month value" };
    }
  }

  try {
    const isoDate = new CalendarDate(year, month, day);
    return { date: isoDate, error: false };
  } catch (err) {
    return { date: null, error: (err as Error).message };
  }
}

/**
 * Parses a string into a ZonedDateTime.
 * @param inputDate - The input date string.
 * @param timeZone - The time zone to use for parsing. Defaults to the local time zone.
 * @returns An object containing the parsed date and any error encountered.
 */
export function parseZonedDateTime(
  inputDate: string,
  locale: string = getCurrentLocale(),
  timeZone: string = getLocalTimeZone(),
): {
  date: DateValue | null;
  error: string | false;
} {
  const parsedDate = parseCalendarDate(inputDate, locale);
  if (!parsedDate.date || parsedDate.error) {
    return { ...parsedDate, date: null };
  }
  try {
    const zonedDate = toZoned(parsedDate.date, timeZone, "compatible");
    return { date: zonedDate, error: false };
  } catch (err) {
    return { date: null, error: (err as Error).message };
  }
}

/**
 * Checks if a date supports time fields.
 * @param date - The date to check.
 * @returns `true` if the date supports time fields, otherwise `false`.
 */
export const dateSupportsTime = (
  date: DateValue,
): date is CalendarDateTime | ZonedDateTime =>
  date instanceof CalendarDateTime || date instanceof ZonedDateTime;

/**
 * Extracts time fields from a date range selection.
 * @param selectedDate - The selected date range.
 * @returns An object containing the start and end time fields.
 */
export function extractTimeFieldsFromDateRange(
  selectedDate: DateRangeSelection | null,
): RangeTimeFields {
  let startTime: TimeFields | undefined;
  let endTime: TimeFields | undefined;
  if (selectedDate) {
    if (selectedDate.startDate && dateSupportsTime(selectedDate.startDate)) {
      const { hour, minute, second, millisecond } = selectedDate.startDate;
      startTime = { hour, minute, second, millisecond };
    }
    if (selectedDate.endDate && dateSupportsTime(selectedDate.endDate)) {
      const { hour, minute, second, millisecond } = selectedDate.endDate;
      endTime = { hour, minute, second, millisecond };
    }
  }
  return { startTime, endTime };
}

/**
 * Extracts time fields from a single date selection.
 * @param selectedDate - The selected date.
 * @returns The time fields of the selected date, if available.
 */
export function extractTimeFieldsFromDate(
  selectedDate: SingleDateSelection | null,
): TimeFields | undefined {
  if (selectedDate && dateSupportsTime(selectedDate)) {
    const { hour, minute, second, millisecond } = selectedDate;
    return { hour, minute, second, millisecond };
  }
}
