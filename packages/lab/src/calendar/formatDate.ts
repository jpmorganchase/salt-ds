import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

export function getCurrentLocale() {
  return navigator.languages[0];
}

const defaultFormatOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};
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
  return date
    ? new DateFormatter(timeLocale, {...defaultFormatOptions, ...options}).format(date.toDate(timeZone))
    : "";
}
