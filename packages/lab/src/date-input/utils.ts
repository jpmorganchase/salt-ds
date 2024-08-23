import {
  CalendarDate,
  CalendarDateTime,
  type DateValue,
  parseAbsoluteToLocal,
  TimeFields,
  ZonedDateTime,
} from "@internationalized/date";
import { DateRangeSelection, SingleDateSelection } from "../calendar";

export type RangeTimeFields= {
  startTime?: TimeFields;
  endTime?: TimeFields;
};

export function parseCalendarDate(
  inputDate: string | undefined,
): DateValue | undefined {
  if (!inputDate) {
    return undefined;
  }
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  let isoDate: DateValue;
  try {
    isoDate = parseAbsoluteToLocal(date?.toISOString());
  } catch (err) {
    return undefined;
  }
  return isoDate
    ? new CalendarDate(isoDate.year, isoDate.month, isoDate.day)
    : undefined;
}

export function parseZonedDateTime(
  inputDate: string | undefined,
): DateValue | undefined {
  if (!inputDate) {
    return undefined;
  }
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  let isoDate: DateValue;
  try {
    isoDate = parseAbsoluteToLocal(date?.toISOString());
  } catch (err) {
    return undefined;
  }
  return isoDate
    ? new ZonedDateTime(
        isoDate.year,
        isoDate.month,
        isoDate.day,
        isoDate.timeZone,
        isoDate.offset,
        isoDate.hour,
        isoDate.minute,
        isoDate.second,
        isoDate.millisecond,
      )
    : undefined;
}

export const dateSupportsTime = (
  date: DateValue | undefined,
): date is CalendarDateTime | ZonedDateTime =>
  date instanceof CalendarDateTime || date instanceof ZonedDateTime;

export function extractTimeFieldsFromDateRange(
  selectedDate: DateRangeSelection | null | undefined,
): RangeTimeFields {
  let startTime;
  let endTime;
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
