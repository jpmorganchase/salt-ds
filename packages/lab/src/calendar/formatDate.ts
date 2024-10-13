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
  date: DateValue | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!date) {
    return "";
  }
  const timeLocale = locale || getCurrentLocale();
  const timeZone = options?.timeZone || getLocalTimeZone();

  const formatter = new DateFormatter(timeLocale, {
    ...defaultFormatOptions,
    ...options,
  });

  const formattedDate = formatter.formatToParts(date.toDate(timeZone));

  // Determine the separator based on the provided options
  const isNumericFormat =
    options?.month === "numeric" || defaultFormatOptions.month === "numeric";
  const separator = isNumericFormat ? "/" : " ";

  // Some locales (USA) added commas, so construct the final date ourselves from formatter parts
  const parts = [];
  if (options?.day !== undefined || defaultFormatOptions.day !== undefined) {
    const day = formattedDate.find(
      (part: Intl.DateTimeFormatPart) => part.type === "day",
    )?.value;
    if (day) parts.push(day);
  }
  if (
    options?.month !== undefined ||
    defaultFormatOptions.month !== undefined
  ) {
    const month = formattedDate.find(
      (part: Intl.DateTimeFormatPart) => part.type === "month",
    )?.value;
    if (month) parts.push(month);
  }
  if (options?.year !== undefined || defaultFormatOptions.year !== undefined) {
    const year = formattedDate.find(
      (part: Intl.DateTimeFormatPart) => part.type === "year",
    )?.value;
    if (year) parts.push(year);
  }

  return parts.join(separator);
}
