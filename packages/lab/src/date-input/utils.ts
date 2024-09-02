import {
  CalendarDate,
  CalendarDateTime,
  type DateValue,
  type TimeFields,
  ZonedDateTime,
  getLocalTimeZone,
  toZoned,
} from "@internationalized/date";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";

export type RangeTimeFields = {
  startTime?: TimeFields;
  endTime?: TimeFields;
};

/**
 * Parses a string into a CalendarDate.
 * @param inputDate - The input date string.
 * @returns An object containing the parsed date and any error encountered.
 */
export function parseCalendarDate(inputDate: string): {
  date: DateValue | null;
  error: string | false;
} {
  if (!inputDate?.length) {
    return { date: null, error: false };
  }
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) {
    return { date: null, error: "not a valid date" };
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

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
  timeZone: string = getLocalTimeZone(),
): {
  date: DateValue | null;
  error: string | false;
} {
  const parsedDate = parseCalendarDate(inputDate);
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
