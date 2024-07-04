import {
  CalendarDate,
  DateFormatter,
  DateValue,
  getLocalTimeZone,
  parseAbsoluteToLocal,
} from "@internationalized/date";

export function createCalendarDate(
  inputDate: string | undefined
): CalendarDate | undefined {
  if (!inputDate) {
    return undefined;
  }
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    return undefined;
  }
  let isoDate;
  try {
    isoDate = parseAbsoluteToLocal(date?.toISOString());
  } catch (err) {
    return undefined;
  }
  return isoDate
    ? new CalendarDate(isoDate.year, isoDate.month, isoDate.day)
    : undefined;
}

export const formatDate = (date: DateValue | null | undefined): string => {
  //TODO confirm whether EN-GB is the right default ?
  return date
    ? new DateFormatter("EN-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date.toDate(getLocalTimeZone()))
    : "";
};

