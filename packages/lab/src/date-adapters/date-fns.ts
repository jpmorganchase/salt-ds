import {
  type Locale,
  add as addDateFns,
  addDays as addDaysFns,
  addMilliseconds as addMillisecondsDateFns,
  differenceInMilliseconds,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format as formatDateFns,
  getDay,
  getHours,
  getMilliseconds,
  getMinutes,
  getMonth,
  getSeconds,
  getYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  isValid as isValidDateFns,
  parse as parseDateFns,
  set as setDateFns,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  sub as subDateFns,
  subMilliseconds as subMillisecondsDateFns,
} from "date-fns";
import { enUS } from "date-fns/locale";
import type {
  AdapterOptions,
  RecommendedFormats,
  SaltDateAdapter,
  Timezone,
} from "./saltDateAdapter";
import {
  type DateBuilderReturnType,
  type DateDetail,
  DateDetailErrorEnum,
  type TimeFields,
} from "./types";

declare module "./types" {
  interface DateFrameworkTypeMap {
    "date-fns": Date;
  }
}

const defaultFormatMap: { [key: string]: string } = {
  // Year
  YYYY: "yyyy",
  YY: "yy",

  // Month
  MMMM: "MMMM",
  MMM: "MMM",
  MM: "MM",
  M: "M",

  // Day of Month
  DD: "dd",
  D: "d",

  // Day of Week
  dddd: "EEEE",
  ddd: "EEE",
  dd: "EE", // Note: 'dd' in Moment is the same as 'EE' in date-fns
  d: "e",

  // Hour
  HH: "HH",
  H: "H",
  hh: "hh",
  h: "h",

  // Minute
  mm: "mm",
  m: "m",

  // Second
  ss: "ss",
  s: "s",

  // AM/PM
  A: "a",
  a: "a",

  // Timezone
  Z: "XXX",
  ZZ: "XX",
};

/**
 * Adapter for date-fns library, implementing the SaltDateAdapter interface.
 * Provides methods for date manipulation and formatting using date-fns.
 */
export class AdapterDateFns implements SaltDateAdapter<Date, Locale> {
  /**
   * The locale used for date formatting.
   */
  public locale: Locale;

  /**
   * The name of the date library.
   */
  public lib = "date-fns";

  /**
   * Mapping of format tokens from other libraries to date-fns format tokens.
   */
  public formats = defaultFormatMap;

  /**
   * Creates an instance of AdapterDateFns.
   * @param options - Adapter options including locale.
   */
  constructor({ locale }: AdapterOptions<Locale, typeof Date> = {}) {
    this.locale = locale || enUS;
  }

  /**
   * Maps format tokens from other libraries to date-fns format tokens.
   * @param adapterFormat - The format string to map.
   * @returns The mapped format string.
   */
  private mapToDateFnsFormat(adapterFormat: string): string {
    return adapterFormat.replace(
      /Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|m{1,2}|s{1,2}|A|a|Z{1,2}/g,
      (match) => this.formats[match] || match,
    );
  }

  /**
   * Creates a Date object from a string or returns the current date.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use (default is "default").
   * @param locale - The locale to use for parsing.
   * @returns The parsed Date object or null.
   */
  public date = <T extends string | null | undefined>(
    value?: T,
    timezone: Timezone = "default",
    locale?: Locale,
  ): DateBuilderReturnType<T, Date> => {
    type R = DateBuilderReturnType<T, Date>;
    if (value === null) {
      return <R>null;
    }

    const date = value ? new Date(value) : new Date();
    return <R>date;
  };

  /**
   * Formats a Date object using the specified format string.
   * @param date - The Date object to format.
   * @param format - The format string to use.
   * @param locale - The locale to use for formatting.
   * @returns The formatted date string.
   */
  public format(
    date: Date,
    format: RecommendedFormats = "dd MMM yyyy",
    locale?: Locale,
  ): string {
    const dateFnsFormat = this.mapToDateFnsFormat(format);
    return formatDateFns(date, dateFnsFormat, {
      locale: locale ?? this.locale,
    });
  }

  /**
   * Compares two Date objects.
   * @param dateA - The first Date object.
   * @param dateB - The second Date object.
   * @returns 0 if equal, 1 if dateA is after dateB, -1 if dateA is before dateB.
   */
  public compare(dateA: Date, dateB: Date): number {
    const diff = differenceInMilliseconds(dateA, dateB);
    return diff === 0 ? 0 : diff > 0 ? 1 : -1;
  }

  /**
   * Parses a date string using the specified format.
   * @param value - The date string to parse.
   * @param format - The format string to use.
   * @param locale - The locale to use for parsing.
   * @returns A DateDetail object containing the parsed date and any errors.
   */
  public parse(
    value: string,
    format: string,
    locale?: Locale,
  ): DateDetail<Date> {
    const dateFnsFormat = this.mapToDateFnsFormat(format);
    const parsedDate = parseDateFns(value, dateFnsFormat, new Date(), {
      locale: locale ?? this.locale,
    });
    if (isValidDateFns(parsedDate)) {
      return {
        date: parsedDate,
        value,
      };
    }
    return {
      date: null,
      value,
      errors: [
        {
          message: "not a valid date",
          type: DateDetailErrorEnum.INVALID_DATE,
        },
      ],
    };
  }

  /**
   * Checks if a Date object is valid.
   * @param date - The Date object to check.
   * @returns True if the date is valid, false otherwise.
   */
  public isValid(date: Date | null | undefined): boolean {
    return date ? isValidDateFns(date) : false;
  }

  /**
   * Subtracts time from a Date object.
   * @param date - The Date object to subtract from.
   * @param duration - The duration to subtract.
   * @returns The resulting Date object.
   */
  public subtract(
    date: Date,
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
  ): Date {
    const result = subDateFns(date, {
      days,
      weeks,
      months,
      years,
      hours,
      minutes,
      seconds,
    });
    if (milliseconds) {
      return subMillisecondsDateFns(result, milliseconds);
    }
    return result;
  }

  /**
   * Adds time to a Date object.
   * @param date - The Date object to add to.
   * @param duration - The duration to add.
   * @returns The resulting Date object.
   */
  public add(
    date: Date,
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
  ): Date {
    const result = addDateFns(date, {
      days,
      weeks,
      months,
      years,
      hours,
      minutes,
      seconds,
    });
    if (milliseconds) {
      return addMillisecondsDateFns(result, milliseconds);
    }
    return result;
  }

  /**
   * Sets specific components of a Date object.
   * @param date - The Date object to modify.
   * @param components - The components to set.
   * @returns The resulting Date object.
   */
  public set(
    date: Date,
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
  ): Date {
    return setDateFns(date, {
      date: day,
      month,
      year,
      hours: hour,
      minutes: minute,
      seconds: second,
      milliseconds: millisecond,
    });
  }

  /**
   * Checks if two Date objects are the same based on the specified granularity.
   * @param dateA - The first Date object.
   * @param dateB - The second Date object.
   * @param granularity - The granularity to compare by ("day", "month", "year").
   * @returns True if the dates are the same, false otherwise.
   */
  public isSame(
    dateA: Date,
    dateB: Date,
    granularity: "day" | "month" | "year" = "day",
  ): boolean {
    switch (granularity) {
      case "day":
        return isSameDay(dateA, dateB);
      case "month":
        return isSameMonth(dateA, dateB);
      case "year":
        return isSameYear(dateA, dateB);
      default:
        return false;
    }
  }

  /**
   * Gets the start of a specified time period for a Date object.
   * @param date - The Date object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @param locale - The locale to use.
   * @returns The Date object representing the start of the period.
   */
  public startOf(
    date: Date,
    offset: "day" | "week" | "month" | "year",
    locale?: Locale,
  ): Date {
    switch (offset) {
      case "day":
        return startOfDay(date);
      case "week":
        return startOfWeek(date, { locale: locale ?? this.locale });
      case "month":
        return startOfMonth(date);
      case "year":
        return startOfYear(date);
      default:
        return date;
    }
  }

  /**
   * Gets the end of a specified time period for a Date object.
   * @param date - The Date object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @param locale - The locale to use.
   * @returns The Date object representing the end of the period.
   */
  public endOf(
    date: Date,
    offset: "day" | "week" | "month" | "year",
    locale?: Locale,
  ): Date {
    switch (offset) {
      case "day":
        return endOfDay(date);
      case "week":
        return endOfWeek(date, { locale: locale ?? this.locale });
      case "month":
        return endOfMonth(date);
      case "year":
        return endOfYear(date);
      default:
        return date;
    }
  }

  /**
   * Gets the current date with the time set to the start of the day.
   * @param _locale - The locale to use.
   * @returns The current date at the start of the day.
   */
  public today(_locale?: Locale): Date {
    return startOfDay(new Date());
  }

  /**
   * Gets the current date and time.
   * @param locale - The locale to use.
   * @returns The current date and time.
   */
  public now(locale?: Locale): Date {
    return new Date();
  }

  /**
   * Gets the day of the week for a Date object.
   * @param date - The Date object.
   * @param locale - The locale to use.
   * @returns The day of the week as a number (0-6).
   */
  public getDayOfWeek(date: Date, locale?: Locale): number {
    return getDay(date);
  }

  /**
   * Gets the name of the day of the week.
   * @param dow - The day of the week as a number (0-6).
   * @param format - The format for the day name ("long", "short", "narrow").
   * @param locale - The locale to use.
   * @returns The name of the day of the week.
   */
  public getDayOfWeekName(
    dow: number,
    format: "long" | "short" | "narrow",
    locale: Locale,
  ): string {
    const startOfWeekDate = startOfWeek(new Date(), {
      locale: locale ?? this.locale,
    });
    const targetDate = addDaysFns(startOfWeekDate, dow);
    return new Intl.DateTimeFormat(locale?.code ?? this.locale?.code, {
      weekday: format,
    }).format(targetDate);
  }

  /**
   * Gets the day of the month for a Date object.
   * @param date - The Date object.
   * @returns The day of the month as a number (1-31).
   */
  public getDay(date: Date): number {
    return date.getDate();
  }

  /**
   * Gets the month for a Date object.
   * @param date - The Date object.
   * @returns The month as a number (0-11).
   */
  public getMonth(date: Date): number {
    return getMonth(date);
  }

  /**
   * Gets the year for a Date object.
   * @param date - The Date object.
   * @returns The year as a number.
   */
  public getYear(date: Date): number {
    return getYear(date);
  }

  /**
   * Gets the time components for a Date object.
   * @param date - The Date object.
   * @returns An object containing the hour, minute, second, and millisecond.
   */
  public getTime(date: Date): TimeFields | null {
    return {
      hour: getHours(date),
      minute: getMinutes(date),
      second: getSeconds(date),
      millisecond: getMilliseconds(date),
    };
  }
}
