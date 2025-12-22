import { DateTime, Duration, Info, Settings } from "luxon";
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
    luxon: DateTime;
  }
}

const defaultFormatMap: { [key: string]: string } = {
  // Year
  YYYY: "yyyy",
  YY: "yy",

  // Month
  MMMM: "LLLL",
  MMM: "LLL",
  MM: "MM",
  M: "M",

  // Day of Month
  DD: "dd",
  D: "d",

  // Day of Week
  dddd: "cccc",
  ddd: "ccc",
  dd: "cc", // Note: 'dd' in Moment is the same as 'cc' in Luxon
  d: "c",

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
  Z: "ZZ",
  ZZ: "ZZ",
};

/**
 * Adapter for Luxon library, implementing the SaltDateAdapter interface.
 * Provides methods for date manipulation and formatting using Luxon.
 */
export class AdapterLuxon implements SaltDateAdapter<DateTime, string> {
  /**
   * The locale used for date formatting.
   */
  public locale: string;

  /**
   * The name of the date library.
   */
  public lib = "luxon";

  /**
   * Mapping of format tokens from other libraries to Luxon format tokens.
   */
  public formats = defaultFormatMap;

  /**
   * Creates an instance of AdapterLuxon.
   * @param options - Adapter options including locale.
   */
  constructor({ locale }: AdapterOptions<string, typeof DateTime> = {}) {
    this.locale = locale || "en-US";
    Settings.defaultLocale = this.locale;
  }

  /**
   * Maps format tokens from other libraries to Luxon format tokens.
   * @param adapterFormat - The format string to map.
   * @returns The mapped format string.
   */
  private mapToLuxonFormat(adapterFormat: string): string {
    return adapterFormat.replace(
      /Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|m{1,2}|s{1,2}|A|a|Z{1,2}/g,
      (match) => defaultFormatMap[match] || match,
    );
  }

  /**
   * Creates a Luxon DateTime object in the system timezone.
   * @param value - The date string to parse.
   * @returns The parsed Luxon DateTime object.
   */
  private createSystemDate = (value: string): DateTime => {
    const parsedValue = DateTime.fromISO(value);
    return parsedValue.setLocale(this.locale);
  };

  /**
   * Creates a Luxon DateTime object in UTC.
   * @param value - The date string to parse.
   * @returns The parsed Luxon DateTime object.
   */
  private createUTCDate = (value: string): DateTime => {
    const parsedValue = DateTime.fromISO(value, { zone: "utc" });
    return parsedValue.setLocale(this.locale);
  };

  /**
   * Creates a Luxon DateTime object in a specified timezone.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use.
   * @returns The parsed Luxon DateTime object.
   */
  private createTZDate = (value: string, timezone: Timezone): DateTime => {
    const parsedValue = DateTime.fromISO(value, { zone: timezone });
    return parsedValue.setLocale(this.locale);
  };

  /**
   * Creates a Luxon DateTime object from a string or returns an invalid date.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use (default is "default").
   * @returns The parsed Luxon DateTime object or an invalid date object.
   */
  public date = <T extends string | undefined>(
    value?: T,
    timezone: Timezone = "default",
  ): DateTime => {
    if (!value || !this.isValidDateString(value)) {
      return DateTime.invalid("Invalid date string");
    }

    if (timezone === "UTC") {
      return this.createUTCDate(value);
    }

    if (timezone === "system" || timezone === "default") {
      return this.createSystemDate(value);
    }

    return this.createTZDate(value, timezone);
  };

  /**
   * Formats a Luxon DateTime object using the specified format string.
   * Returns an empty string when null or undefined date is given.
   * @param date - The Luxon DateTime object to format.
   * @param format - The format string to use.
   * @returns The formatted date string.
   */
  public format(
    date: DateTime | null | undefined,
    format: RecommendedFormats = "dd MMM yyyy",
  ): string {
    if (this.isValid(date)) {
      const luxonFormat = this.mapToLuxonFormat(format);
      return date.setLocale(this.locale).toFormat(luxonFormat);
    }
    return "";
  }

  /**
   * Compares two Luxon DateTime objects.
   * @param dateA - The first Luxon DateTime object.
   * @param dateB - The second Luxon DateTime object.
   * @returns 0 if equal, 1 if dateA is after dateB, -1 if dateA is before dateB.
   */
  public compare(dateA: DateTime, dateB: DateTime): number {
    const utcDateA = dateA.toUTC();
    const utcDateB = dateB.toUTC();

    if (utcDateA.equals(utcDateB)) {
      return 0;
    }
    return utcDateA < utcDateB ? -1 : 1;
  }

  /**
   * Parses a date string using the specified format.
   * @param value - The date string to parse.
   * @param format - The format string to use.
   * @returns A DateDetail object containing the parsed date and any errors.
   */
  public parse(value: string, format: string): ParserResult<DateTime> {
    const luxonFormat = this.mapToLuxonFormat(format);
    const parsedDate = DateTime.fromFormat(value, luxonFormat, {
      locale: this.locale,
    });
    if (parsedDate.isValid) {
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
   * Checks if a Luxon DateTime object is valid.
   * @param date - The Luxon DateTime object to check, null or undefined.
   * @returns True if the date is valid date object, false otherwise.
   */
  public isValid(date: DateTime | null | undefined): date is DateTime {
    return date instanceof DateTime ? date.isValid : false;
  }

  /**
   * Subtracts time from a Luxon DateTime object.
   * @param date - The Luxon DateTime object to subtract from.
   * @param duration - The duration to subtract.
   * @returns The resulting Luxon DateTime object.
   */
  public subtract(
    date: DateTime,
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
  ): DateTime {
    return date.minus(
      Duration.fromObject({
        days,
        weeks,
        months,
        years,
        hours,
        minutes,
        seconds,
        milliseconds,
      }),
    );
  }

  /**
   * Adds time to a Luxon DateTime object.
   * @param date - The Luxon DateTime object to add to.
   * @param duration - The duration to add.
   * @returns The resulting Luxon DateTime object.
   */
  public add(
    date: DateTime,
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
  ): DateTime {
    return date.plus(
      Duration.fromObject({
        days,
        weeks,
        months,
        years,
        hours,
        minutes,
        seconds,
        milliseconds,
      }),
    );
  }

  /**
   * Sets specific components of a Luxon DateTime object.
   * @param date - The Luxon DateTime object to modify.
   * @param components - The components to set, the month is a number (1-12).
   * @returns The resulting Luxon DateTime object.
   */
  public set(
    date: DateTime,
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
  ): DateTime {
    return date.set({
      day,
      month: month,
      year,
      hour,
      minute,
      second,
      millisecond,
    });
  }

  /**
   * Get the timezone from the DateTime object
   * @param date - A Luxon DateTime object
   * @returns  'UTC' | 'system' or the IANA time zone
   */
  public getTimezone = (date: DateTime): string => {
    if (date.zone.type === "system") {
      return "system";
    }
    return date.zoneName ?? "";
  };

  /**
   * Set the timezone for the DateTime object
   * @param date - A Luxon DateTime object
   * @param timezone - Timezone to set date object to
   * @returns  date object set to the timezone
   */
  public setTimezone = (date: DateTime, timezone: Timezone): DateTime => {
    if (!date.zone.equals(Info.normalizeZone(timezone))) {
      return date.setZone(timezone, { keepLocalTime: true });
    }
    return date;
  };

  /**
   * Checks if two Luxon DateTime objects are the same based on the specified granularity.
   * @param dateA - The first Luxon DateTime object.
   * @param dateB - The second Luxon DateTime object.
   * @param granularity - The granularity to compare by ("day", "month", "year").
   * @returns True if the dates are the same, false otherwise.
   */
  public isSame(
    dateA: DateTime,
    dateB: DateTime,
    granularity: "day" | "month" | "year" = "day",
  ): boolean {
    return dateA.hasSame(dateB, granularity);
  }

  /**
   * Gets the start of a specified time period for a Luxon DateTime object.
   * @param date - The Luxon DateTime object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @returns The Luxon DateTime object representing the start of the period.
   */
  public startOf(
    date: DateTime,
    offset: "day" | "week" | "month" | "year",
  ): DateTime {
    const localizedDate = date.setLocale(this.locale);
    return localizedDate.startOf(offset, { useLocaleWeeks: true });
  }

  /**
   * Gets the end of a specified time period for a Luxon DateTime object.
   * @param date - The Luxon DateTime object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @returns The Luxon DateTime object representing the end of the period.
   */
  public endOf(
    date: DateTime,
    offset: "day" | "week" | "month" | "year",
  ): DateTime {
    const localizedDate = date.setLocale(this.locale);
    return localizedDate.endOf(offset, { useLocaleWeeks: true });
  }

  /**
   * Gets the current date with the time set to the start of the day.
   * @param timezone - Timezone, defaults to library "default"
   * @returns The current date at the start of the day.
   */
  public today(timezone: Timezone = "default"): DateTime {
    const currentDate = DateTime.local().setZone(timezone);
    const localizedDate = currentDate.setLocale(this.locale);
    return localizedDate.startOf("day");
  }

  /**
   * Gets the current date and time.
   * @param timezone - Timezone, defaults to library "default"
   * @returns The current date and time.
   */
  public now(timezone: Timezone = "default"): DateTime {
    const currentDate = DateTime.local().setZone(timezone);
    return currentDate.setLocale(this.locale);
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
    const referenceDate = DateTime.local().setLocale(this.locale);
    const startOfWeek = referenceDate.startOf("week", { useLocaleWeeks: true });
    const targetDate = startOfWeek.plus({ days: dow });
    return targetDate.toLocaleString({ weekday: format });
  }

  /**
   * Gets the day of the month for a Luxon DateTime object.
   * @param date - The Luxon DateTime object.
   * @returns The day of the month as a number (1-31).
   */
  public getDay(date: DateTime): number {
    return date.day;
  }

  /**
   * Gets the month for a Luxon DateTime object.
   * @param date - The Luxon DateTime object.
   * @returns The month as a number (1-12).
   */
  public getMonth(date: DateTime): number {
    return date.month;
  }

  /**
   * Gets the year for a Luxon DateTime object.
   * @param date - The Luxon DateTime object.
   * @returns The year as a number.
   */
  public getYear(date: DateTime): number {
    return date.year;
  }

  /**
   * Gets the time components for a Luxon DateTime object.
   * @param date - The Luxon DateTime object.
   * @returns An object containing the hour, minute, second, and millisecond.
   */
  public getTime(date: DateTime): TimeFields {
    return {
      hour: date.hour,
      minute: date.minute,
      second: date.second,
      millisecond: date.millisecond,
    };
  }

  /**
   * Validate date string so it can be parsed
   * @param value
   */
  public isValidDateString(value: string): boolean {
    const dateTime = DateTime.fromISO(value);
    return dateTime.isValid;
  }

  /**
   * Clone the date object
   * @param date
   */
  public clone(date: DateTime): DateTime {
    return DateTime.fromMillis(date.toMillis());
  }

  public toJSDate = (value: DateTime) => {
    return value.toJSDate();
  };
}
