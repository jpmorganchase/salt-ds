import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

export function getCurrentLocale() {
  return navigator.languages[0];
}
export function formatDate(
  date: DateValue | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!date) {
    return "";
  }
  const timeLocale = locale || getCurrentLocale();
  const timeZone = options?.timeZone || getLocalTimeZone();
  const formatter = new DateFormatter(timeLocale, options);
  return formatter.format(date.toDate(timeZone));
}
