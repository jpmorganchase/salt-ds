import {
  CalendarDate,
  type DateValue,
  parseAbsoluteToLocal,
  parseDate,
} from "@internationalized/date";

export function createCalendarDate(
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
