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

export function parseCalendarDate(
  inputDate: string | undefined,
): CalendarDate | undefined {
  if (!inputDate) {
    return undefined;
  }
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  try {
    const isoDate = new CalendarDate(year, month, day);
    return isoDate;
  } catch (err) {
    return undefined;
  }
}

export function parseZonedDateTime(
  inputDate: string | undefined,
  timeZone: string = getLocalTimeZone(),
): DateValue | undefined {
  const date = parseCalendarDate(inputDate);
  if (!date) {
    return date;
  }
  return toZoned(date, timeZone, "compatible");
}

export const dateSupportsTime = (
  date: DateValue | undefined,
): date is CalendarDateTime | ZonedDateTime =>
  date instanceof CalendarDateTime || date instanceof ZonedDateTime;

export function extractTimeFieldsFromDateRange(
  selectedDate: DateRangeSelection | null | undefined,
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

export function extractTimeFieldsFromDate(
  selectedDate: SingleDateSelection | null | undefined,
): TimeFields | undefined {
  if (selectedDate && dateSupportsTime(selectedDate)) {
    const { hour, minute, second, millisecond } = selectedDate;
    return { hour, minute, second, millisecond };
  }
}
