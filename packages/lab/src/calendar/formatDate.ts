import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

/**
 * Gets the current locale from the browser.
 * @returns The current locale as a string.
 */
export function getCurrentLocale() {
  return navigator.languages[0];
}

/**
 * Default options for date formatting.
 */
const defaultFormatOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

/**
 * Formats a date value according to the specified locale and options.
 * @param date - The date value to format.
 * @param locale - The locale to use for formatting. Defaults to the current locale.
 * @param options - Additional options for date formatting.
 * @returns The formatted date as a string.
 */
export function formatDate(
  date: DateValue | null,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!date) {
    return "";
  }
  const timeLocale = locale || getCurrentLocale();
  const timeZone = options?.timeZone || getLocalTimeZone();
  return date
    ? new DateFormatter(timeLocale, {
        ...defaultFormatOptions,
        ...options,
      }).format(date.toDate(timeZone))
    : "";
}
