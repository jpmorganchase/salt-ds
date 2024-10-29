import type {
  CreateDateReturnType,
  DateDetail,
  DateFrameworkType,
  TimeFields,
} from "./types";

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
 * Timezone options for date operations.
 */
export type Timezone = "default" | "system" | "UTC" | string;

/**
 * Interface for a date adapter, providing methods for date manipulation and formatting.
 *
 * @template TDate - The type of the date object used by the adapter.
 * @template TLocale - The type of the locale, defaulting to any.
 */
export interface SaltDateAdapter<
  TDate extends DateFrameworkType,
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
   * Creates a date object from a string or returns the current date.
   *
   * @param value - The date string to parse.
   * @param timezone - The timezone to use.
   * @param locale - The locale to use for parsing.
   * @returns The created date object or null.
   */
  date<T extends string | null | undefined>(
    value?: T,
    timezone?: string,
    locale?: TLocale,
  ): CreateDateReturnType<T, TDate>;

  /**
   * Formats a date object using the specified format string.
   *
   * @param date - The date object to format.
   * @param format - The format string to use.
   * @param locale - The locale to use for formatting.
   * @returns The formatted date string.
   */
  format(date: TDate, format?: RecommendedFormats, locale?: TLocale): string;

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
   * @param locale - The locale to use for parsing.
   * @returns A DateDetail object containing the parsed date and any errors.
   */
  parse(value: string, format: string, locale?: TLocale): DateDetail<TDate>;

  /**
   * Checks if a date object is valid.
   *
   * @param date - The date object to check.
   * @returns True if the date is valid, false otherwise.
   */
  isValid(date: TDate): boolean;

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
   * @param locale - The locale to use.
   * @returns The date object representing the start of the period.
   */
  startOf(
    date: TDate,
    granularity: "day" | "week" | "month" | "year",
    locale?: TLocale,
  ): TDate;

  /**
   * Gets the end of a specified time period for a date object.
   *
   * @param date - The date object.
   * @param granularity - The time period ("day", "week", "month", "year").
   * @param locale - The locale to use.
   * @returns The date object representing the end of the period.
   */
  endOf(
    date: TDate,
    granularity: "day" | "week" | "month" | "year",
    locale?: TLocale,
  ): TDate;

  /**
   * Gets the current date with the time set to the start of the day.
   *
   * @param locale - The locale to use.
   * @returns The current date at the start of the day.
   */
  today(locale?: TLocale): TDate;

  /**
   * Gets the current date and time.
   *
   * @param locale - The locale to use.
   * @returns The current date and time.
   */
  now(locale?: TLocale): TDate;

  /**
   * Gets the day of the week for a date object.
   *
   * @param date - The date object.
   * @param locale - The locale to use.
   * @returns The day of the week as a number (0-6).
   */
  getDayOfWeek(date: TDate, locale?: TLocale): number;

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
  getTime(date: TDate): TimeFields | null;

  /**
   * Gets the name of the day of the week.
   *
   * @param dow - The day of the week as a number (0-6).
   * @param format - The format for the day name ("long", "short", "narrow").
   * @param locale - The locale to use.
   * @returns The name of the day of the week.
   */
  getDayOfWeekName(
    dow: number,
    format: "long" | "short" | "narrow",
    locale?: any,
  ): string;
}
