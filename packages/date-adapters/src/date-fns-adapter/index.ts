import {
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
  type Locale,
  parse as parseDateFns,
  parseISO,
  set as setDateFns,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  sub as subDateFns,
  subMilliseconds as subMillisecondsDateFns,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  type AdapterOptions,
  DateDetailError,
  type ParserResult,
  type RecommendedFormats,
  type SaltDateAdapter,
  type TimeFields,
  type Timezone,
} from "../types";

declare module "@salt-ds/date-adapters" {
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
   * Creates a Date object from a string or returns an invalid date.
   * @param value - The date string to parse.
   * @returns The parsed Date object or an invalid date object.
   */
  public date = <T extends string | undefined>(value?: T): Date => {
    if (!value || !this.isValidDateString(value)) {
      return new Date(Number.NaN);
    }
    return new Date(value);
  };

  /**
   * Formats a Date object using the specified format string.
   * Returns an empty string when null or undefined date is given.
   * @param date - The Date object to format.
   * @param format - The format string to use.
   * @returns The formatted date string.
   */
  public format(
    date: Date | null | undefined,
    format: RecommendedFormats = "dd MMM yyyy",
  ): string {
    if (this.isValid(date)) {
      const dateFnsFormat = this.mapToDateFnsFormat(format);
      return formatDateFns(date, dateFnsFormat, {
        locale: this.locale,
      });
    }
    return "";
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
   * @returns A DateDetail object containing the parsed date and any errors.
   */
  public parse(value: string, format: string): ParserResult<Date> {
    const dateFnsFormat = this.mapToDateFnsFormat(format);
    const parsedDate = parseDateFns(value, dateFnsFormat, new Date(), {
      locale: this.locale,
    });
    if (isValidDateFns(parsedDate)) {
      return {
        date: parsedDate,
        value,
      };
    }
    const isDateDefined = !!value?.trim().length;
    return {
      date: parsedDate,
      value,
      errors: [
        {
          message: isDateDefined ? "not a valid date" : "no date defined",
          type: isDateDefined
            ? DateDetailError.INVALID_DATE
            : DateDetailError.UNSET,
        },
      ],
    };
  }

  /**
   * Checks if a Date object is valid.
   * @param date - The Date object to check, null or undefined.
   * @returns True if the date is valid date object, false otherwise.
   */
  // biome-ignore lint/suspicious/noExplicitAny: date object
  public isValid(date: Date | null | undefined): date is Date {
    return date instanceof Date && isValidDateFns(date);
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
   * @param components - The components to set, the month is a number (1-12).
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
      month: month !== undefined ? month - 1 : month,
      year,
      hours: hour,
      minutes: minute,
      seconds: second,
      milliseconds: millisecond,
    });
  }

  /**
   * Get the timezone from the Date object (un-supported by v3 date-fns/Date object)
   * @returns "default" as Timezones are not supported by the date-fns/Date object
   */
  public getTimezone = (): string => {
    return "default";
  };

  /**
   * Set the timezone for the Date object (un-supported by v3 date-fns/Date object)
   * @param date - A Date object
   * @param _timezone - Timezone to set date object to (un-used)
   * @returns  date object set to the timezone
   */
  public setTimezone = (date: Date, _timezone: Timezone): Date => {
    return date;
  };

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
   * @returns The Date object representing the start of the period.
   */
  public startOf(date: Date, offset: "day" | "week" | "month" | "year"): Date {
    switch (offset) {
      case "day":
        return startOfDay(date);
      case "week":
        return startOfWeek(date, { locale: this.locale });
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
   * @returns The Date object representing the end of the period.
   */
  public endOf(date: Date, offset: "day" | "week" | "month" | "year"): Date {
    switch (offset) {
      case "day":
        return endOfDay(date);
      case "week":
        return endOfWeek(date, { locale: this.locale });
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
   * @returns The current date at the start of the day.
   */
  public today(): Date {
    return startOfDay(new Date());
  }

  /**
   * Gets the current date and time.
   * @returns The current date and time.
   */
  public now(): Date {
    return new Date();
  }

  /**
   * Gets the day of the week for a Date object.
   * @param date - The Date object.
   * @returns The day of the week as a number (0-6).
   */
  public getDayOfWeek(date: Date): number {
    return getDay(date);
  }

  /**
   * Gets the name of the day of the week.
   * @param dow - The day of the week as a number (0-6).
   * @param format - The format for the day name ("long", "short", "narrow").
   * @returns The name of the day of the week.
   */
  public getDayOfWeekName(
    dow: number,
    format: "long" | "short" | "narrow",
  ): string {
    const startOfWeekDate = startOfWeek(new Date(), {
      locale: this.locale,
    });
    const targetDate = addDaysFns(startOfWeekDate, dow);
    return new Intl.DateTimeFormat(this.locale?.code, {
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
   * @returns The month as a number (1-12).
   */
  public getMonth(date: Date): number {
    return getMonth(date) + 1;
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
  public getTime(date: Date): TimeFields {
    return {
      hour: getHours(date),
      minute: getMinutes(date),
      second: getSeconds(date),
      millisecond: getMilliseconds(date),
    };
  }

  /**
   * Validate date string so it can be parsed
   * @param value
   */
  public isValidDateString(value: string): boolean {
    try {
      const date = parseISO(value);
      return isValidDateFns(date);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clone the date object
   * @param date
   */
  public clone(date: Date): Date {
    return new Date(date.getTime());
  }
}
