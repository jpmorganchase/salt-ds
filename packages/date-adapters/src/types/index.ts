/**
 * To add a new adapter, then, add the adapter's date object to `DateFrameworkTypeMap` interface
 *
 * declare module "@salt-ds/date-adapters" {
 *   interface DateFrameworkTypeMap {
 *     luxon: DateTime;
 *   }
 * }
 */

export interface DateFrameworkTypeMap {};
/**
 * Represents the date object of a date framework.
 *
 * If the DateFrameworkTypeMap is empty, it defaults to any; otherwise, it is a union of all types in the map.
 */

export type DateFrameworkType = keyof DateFrameworkTypeMap extends never
  ? // biome-ignore lint/suspicious/noExplicitAny: date framework
    any
  : DateFrameworkTypeMap[keyof DateFrameworkTypeMap];

/**
 * Enum representing possible date detail error types.
 */
export const DateDetailError = {
  /** Error type for unset values */
  UNSET: "unset",
  /** Error type for values that are not a date */
  NOT_A_DATE: "not-a-date",
  /** Error type for invalid date values */
  INVALID_DATE: "date",
  /** Error type for invalid month values */
  INVALID_MONTH: "month",
  /** Error type for invalid day values */
  INVALID_DAY: "day",
  /** Error type for invalid year values */
  INVALID_YEAR: "year",
} as const;
export type DateDetailErrorType =
  (typeof DateDetailError)[keyof typeof DateDetailError];

/**
 * Represents an error detail for a date.
 */
export type DateDetailError = {
  /** The error code */
  type: DateDetailErrorType | string;
  /** The error message */
  message: string;
};

/**
 * Provides a way to return date errors in a uniform way.
 */
export type DateDetail = {
  /** The original entered value, if applicable */
  value?: string;
  /** The errors found by the parser */
  errors?: DateDetailError[];
};

/**
 * Represents the time components of a date.
 */
export type TimeFields = {
  /** The hour component */
  hour: number;
  /** The minute component */
  minute: number;
  /** The second component */
  second: number;
  /** The millisecond component */
  millisecond: number;
};

/**
 * Options for configuring a date adapter.
 *
 * @template TLocale - The type of the locale.
 * @template TInstance - The type of the date library instance.
 */
export type AdapterOptions<TLocale, TInstance> = {
  /**
   * The locale to be used by the date adapter.
   */
  locale?: TLocale;

  /**
   * The instance of the date library to be used by the adapter.
   */
  instance?: TInstance;
};

/**
 * Recommended date formats for formatting date strings.
 */
export type RecommendedFormats =
  | "dd"
  | "dddd"
  | "D"
  | "DD"
  | "DD MMM YYYY"
  | "DD MMMM YYYY"
  | "MMMM YYYY"
  | "YYYY"
  | string;

/**
 * Timezone options for date/time operations.
 - "default", the default timezone of the date library will be used.
 - "system", the local system's timezone will be applied.
 - "UTC", the time will be returned in UTC.
 - string, a valid IANA timezone identifier, the time will be returned for that specific timezone.
 */
export type Timezone = "default" | "system" | "UTC" | string;

export type ParserResult<TDate extends DateFrameworkType> = {
  date: TDate;
} & DateDetail;

/**
 * Interface for a date adapter, providing methods for date manipulation and formatting.
 *
 * @template TDate - The type of the date object used by the adapter.
 * @template TLocale - The type of the locale, defaulting to any.
 */
export interface SaltDateAdapter<
  TDate extends DateFrameworkType,
  // biome-ignore lint/suspicious/noExplicitAny: locale is date framework dependent
  TLocale = any,
> {
  /**
   * The locale used by the date adapter.
   */
  locale?: TLocale;

  /**
   * The name of the date library.
   */
  lib: string;

  /**
   * Creates a date object from a string or returns an invalid date.
   *
   * @param value - The date string to parse.
   * @param timezone - The timezone to use.
   * @returns The parsed Date object or an invalid date object.
   */
  date<T extends string | undefined>(value?: T, timezone?: Timezone): TDate;

  /**
   * Formats a date object using the specified format string.
   *
   * @param date - The date object to format.
   * @param format - The format string to use.
   * Returns an empty string when null or undefined date is given.
   */
  format(date: TDate | null | undefined, format?: RecommendedFormats): string;

  /**
   * Compares two date objects.
   *
   * @param dateA - The first date object.
   * @param dateB - The second date object.
   * @returns 0 if equal, 1 if dateA is after dateB, -1 if dateA is before dateB.
   */
  compare(dateA: TDate, dateB: TDate): number;

  /**
   * Parses a date string using the specified format.
   *
   * @param value - The date string to parse.
   * @param format - The format string to use.
   * @returns A ParserResult object containing the parsed date and any errors.
   */
  parse(value: string, format: string): ParserResult<TDate>;

  /**
   * Checks if a date object is valid.
   *
   * @param date - The date object to check, null or undefined.
   * @returns True if the date is valid, false otherwise.
   */
  isValid(date: TDate | null | undefined): date is TDate;

  /**
   * Adds time to a date object.
   *
   * @param date - The date object to add to.
   * @param duration - The duration to add.
   * @returns The resulting date object.
   */
  add(
    date: TDate,
    {
      days,
      weeks,
      months,
      years,
      hours,
      minutes,
      seconds,
      milliseconds,
    }: {
      days?: number;
      weeks?: number;
      months?: number;
      years?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
      milliseconds?: number;
    },
  ): TDate;

  /**
   * Subtracts time from a date object.
   *
   * @param date - The date object to subtract from.
   * @param duration - The duration to subtract.
   * @returns The resulting date object.
   */
  subtract(
    date: TDate,
    {
      days,
      weeks,
      months,
      years,
      hours,
      minutes,
      seconds,
      milliseconds,
    }: {
      days?: number;
      weeks?: number;
      months?: number;
      years?: number;
      hours?: number;
      minutes?: number;
      seconds?: number;
      milliseconds?: number;
    },
  ): TDate;

  /**
   * Sets specific components of a date object.
   *
   * @param date - The date object to modify.
   * @param components - The components to set.
   * @returns The resulting date object.
   */
  set(
    date: TDate,
    {
      day,
      month,
      year,
      hour,
      minute,
      second,
      millisecond,
    }: {
      day?: number;
      month?: number;
      year?: number;
      hour?: number;
      minute?: number;
      second?: number;
      millisecond?: number;
    },
  ): TDate;

  /**
   * Checks if two date objects are the same based on the specified granularity.
   *
   * @param dateA - The first date object.
   * @param dateB - The second date object.
   * @param granularity - The granularity to compare by ("day", "month", "year").
   * @returns True if the dates are the same, false otherwise.
   */
  isSame(
    dateA: TDate,
    dateB: TDate,
    granularity: "day" | "month" | "year",
  ): boolean;

  /**
   * Gets the start of a specified time period for a date object.
   *
   * @param date - The date object.
   * @param granularity - The time period ("day", "week", "month", "year").
   * @returns The date object representing the start of the period.
   */
  startOf(date: TDate, granularity: "day" | "week" | "month" | "year"): TDate;

  /**
   * Gets the end of a specified time period for a date object.
   *
   * @param date - The date object.
   * @param granularity - The time period ("day", "week", "month", "year").
   * @returns The date object representing the end of the period.
   */
  endOf(date: TDate, granularity: "day" | "week" | "month" | "year"): TDate;

  /**
   * Gets the current date with the time set to the start of the day.
   *
   * @param timezone - The timezone to use.
   * @returns The current date at the start of the day.
   */
  today(timezone?: Timezone): TDate;

  /**
   * Gets the current date and time.
   *
   * @param timezone - The timezone to use.
   * @returns The current date and time.
   */
  now(timezone?: Timezone): TDate;

  /**
   * Gets the day of the week for a date object.
   *
   * @param date - The date object.
   * @returns The day of the week as a number (0-6).
   */
  getDayOfWeek(date: TDate): number;

  /**
   * Gets the day of the month for a date object.
   *
   * @param date - The date object.
   * @returns The day of the month as a number (1-31).
   */
  getDay(date: TDate): number;

  /**
   * Gets the month for a date object.
   *
   * @param date - The date object.
   * @returns The month as a number (0-11).
   */
  getMonth(date: TDate): number;

  /**
   * Gets the year for a date object.
   *
   * @param date - The date object.
   * @returns The year as a number.
   */
  getYear(date: TDate): number;

  /**
   * Gets the time components for a date object.
   *
   * @param date - The date object.
   * @returns An object containing the hour, minute, second, and millisecond.
   */
  getTime(date: TDate): TimeFields;

  /**
   * Get timezone
   * @param date - The date object.
   */
  getTimezone(date: TDate): string;

  /**
   * Set the timezone for the date object
   * @param date - The date object.
   * @param timezone - Timezone to set date object to
   * @returns  date object set to the timezone
   */
  setTimezone(date: TDate, timezone: Timezone): TDate;

  /**
   * Gets the name of the day of the week.
   *
   * @param dow - The day of the week as a number (0-6).
   * @param format - The format for the day name ("long", "short", "narrow").
   * @returns The name of the day of the week.
   */
  getDayOfWeekName(dow: number, format: "long" | "short" | "narrow"): string;

  /**
   * Clone the date
   *
   * @param date
   */
  clone(date: TDate): TDate;

  toJSDate:(value: TDate) => Date;
}
