import defaultDayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
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

type Constructor = {
  (...args: Parameters<typeof defaultDayjs>): Dayjs;
  tz?: (value: Parameters<typeof defaultDayjs>[0], timezone: string) => Dayjs;
  utc?: (value?: Parameters<typeof defaultDayjs>[0]) => Dayjs;
};

declare module "./types" {
  interface DateFrameworkTypeMap {
    dayjs: Dayjs;
  }
}

defaultDayjs.extend(utc);
defaultDayjs.extend(timezone);
defaultDayjs.extend(weekday);

// Dayjs expects Title-case months, so treats "jun" as invalid
function capitalizeMonthInDate(value: string, format: string) {
  const separatorMatch = format.match(/[^A-Za-z0-9]/);
  const separator = separatorMatch ? separatorMatch[0] : " ";

  const formatParts = format.split(separator);
  const valueParts = value.split(separator);

  return formatParts
    .map((part, index) => {
      const word = valueParts[index];
      if (part.includes("MMM") && word) {
        return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
      }
      return word || "";
    })
    .join(separator);
}

/**
 * Adapter for Day.js library, implementing the SaltDateAdapter interface.
 * Provides methods for date manipulation and formatting using Day.js.
 */
export class AdapterDayjs implements SaltDateAdapter<Dayjs, string> {
  /**
   * The Day.js instance used for date operations.
   */
  public dayjs: Constructor;

  /**
   * The locale used for date formatting.
   */
  public locale: string;

  /**
   * The name of the date library.
   */
  public lib = "dayjs";

  /**
   * Creates an instance of AdapterDayjs.
   * @param options - Adapter options including locale.
   * @param instance - The Day.js instance to use.
   */
  constructor(
    { locale }: AdapterOptions<string, typeof defaultDayjs> = {},
    instance: Constructor,
  ) {
    this.locale = locale || "en";
    this.dayjs = instance || defaultDayjs;

    // Allow user customization
    if (!instance) {
      defaultDayjs.extend(customParseFormat);
    }
  }

  /**
   * Creates a Day.js date object in the system timezone.
   * @param value - The date string to parse.
   * @param locale - The locale to use for parsing.
   * @returns The parsed Day.js date object.
   */
  private createSystemDate = (
    value: string | undefined,
    locale?: string,
  ): Dayjs => {
    return this.dayjs(value).locale(locale ?? this.locale);
  };

  /**
   * Creates a Day.js date object in UTC.
   * @param value - The date string to parse.
   * @param locale - The locale to use for parsing.
   * @returns The parsed Day.js date object.
   * @throws Error if the UTC plugin is missing.
   */
  private createUTCDate = (
    value: string | undefined,
    locale?: string,
  ): Dayjs => {
    if (!this.dayjs.utc) {
      throw new Error("Salt Day.js adapter: missing UTC plugin");
    }
    return this.dayjs.utc(value).locale(locale ?? this.locale);
  };

  /**
   * Creates a Day.js date object in a specified timezone.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use.
   * @param locale - The locale to use for parsing.
   * @returns The parsed Day.js date object.
   * @throws Error if the timezone plugin is missing.
   */
  private createTZDate = (
    value: string | undefined,
    timezone: Timezone,
    locale?: string,
  ): Dayjs => {
    if (!this.dayjs.tz) {
      throw new Error("Salt Day.js adapter: missing timezone plugin");
    }
    return timezone === "default"
      ? this.dayjs(value).locale(locale ?? this.locale)
      : this.dayjs.tz(value, timezone).locale(locale ?? this.locale);
  };

  /**
   * Creates a Day.js date object from a string or returns the current date.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use (default is "default").
   * @param locale - The locale to use for parsing.
   * @returns The parsed Day.js date object or null.
   */
  public date = <T extends string | null | undefined>(
    value?: T,
    timezone: Timezone = "default",
    locale?: string,
  ): DateBuilderReturnType<T, Dayjs> => {
    type R = DateBuilderReturnType<T, Dayjs>;
    if (value === null) {
      return <R>null;
    }

    if (timezone === "UTC") {
      return <R>this.createUTCDate(value, locale);
    }

    if (timezone === "system" || timezone === "default") {
      return <R>this.createSystemDate(value, locale);
    }

    return <R>this.createTZDate(value, timezone, locale);
  };

  /**
   * Formats a Day.js date object using the specified format string.
   * @param date - The Day.js date object to format.
   * @param format - The format string to use.
   * @param locale - The locale to use for formatting.
   * @returns The formatted date string.
   */
  public format(
    date: Dayjs,
    format: RecommendedFormats = "DD MMM YYYY",
    locale?: string,
  ): string {
    return date.locale(locale ?? this.locale).format(format);
  }

  /**
   * Compares two Day.js date objects.
   * @param dateA - The first Day.js date object.
   * @param dateB - The second Day.js date object.
   * @returns 0 if equal, 1 if dateA is after dateB, -1 if dateA is before dateB.
   */
  public compare(dateA: Dayjs, dateB: Dayjs): number {
    if (dateA.isSame(dateB)) {
      return 0;
    }
    if (dateA.isBefore(dateB)) {
      return -1;
    }
    return 1;
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
    locale?: string,
  ): DateDetail<Dayjs> {
    if (value === "") {
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

    const normalisedValue = capitalizeMonthInDate(value, format);
    const newDate = this.dayjs(
      normalisedValue,
      format,
      locale ?? this.locale,
      true,
    );
    if (newDate.isValid()) {
      return {
        date: newDate,
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
   * Checks if a Day.js date object is valid.
   * @param date - The Day.js date object to check.
   * @returns True if the date is valid, false otherwise.
   */
  public isValid(date: Dayjs | null | undefined): boolean {
    return date ? date.isValid() : false;
  }

  /**
   * Subtracts time from a Day.js date object.
   * @param date - The Day.js date object to subtract from.
   * @param duration - The duration to subtract.
   * @returns The resulting Day.js date object.
   */
  public subtract(
    date: Dayjs,
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
  ): Dayjs {
    let newDate = date;
    if (days) {
      newDate = newDate.subtract(days, "day");
    }
    if (weeks) {
      newDate = newDate.subtract(weeks, "week");
    }
    if (months) {
      newDate = newDate.subtract(months, "month");
    }
    if (years) {
      newDate = newDate.subtract(years, "year");
    }
    if (hours) {
      newDate = newDate.subtract(hours, "hours");
    }
    if (minutes) {
      newDate = newDate.subtract(minutes, "minutes");
    }
    if (seconds) {
      newDate = newDate.subtract(seconds, "seconds");
    }
    if (milliseconds) {
      newDate = newDate.subtract(milliseconds, "milliseconds");
    }
    return newDate;
  }

  /**
   * Adds time to a Day.js date object.
   * @param date - The Day.js date object to add to.
   * @param duration - The duration to add.
   * @returns The resulting Day.js date object.
   */
  public add(
    date: Dayjs,
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
  ): Dayjs {
    let newDate = date;
    if (days) {
      newDate = newDate.add(days, "day");
    }
    if (weeks) {
      newDate = newDate.add(weeks, "week");
    }
    if (months) {
      newDate = newDate.add(months, "month");
    }
    if (years) {
      newDate = newDate.add(years, "year");
    }
    if (hours) {
      newDate = newDate.add(hours, "hour");
    }
    if (minutes) {
      newDate = newDate.add(minutes, "minute");
    }
    if (seconds) {
      newDate = newDate.add(seconds, "second");
    }
    if (milliseconds) {
      newDate = newDate.add(milliseconds, "millisecond");
    }
    return newDate;
  }

  /**
   * Sets specific components of a Day.js date object.
   * @param date - The Day.js date object to modify.
   * @param components - The components to set.
   * @returns The resulting Day.js date object.
   */
  public set(
    date: Dayjs,
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
  ): Dayjs {
    let newDate = date.clone();
    if (day) {
      newDate = newDate.date(day);
    }
    if (month) {
      newDate = newDate.month(month);
    }
    if (year) {
      newDate = newDate.year(year);
    }
    if (hour) {
      newDate = newDate.hour(hour);
    }
    if (minute) {
      newDate = newDate.minute(minute);
    }
    if (second) {
      newDate = newDate.second(second);
    }
    if (millisecond) {
      newDate = newDate.millisecond(millisecond);
    }
    return newDate;
  }

  /**
   * Checks if two Day.js date objects are the same based on the specified granularity.
   * @param dateA - The first Day.js date object.
   * @param dateB - The second Day.js date object.
   * @param granularity - The granularity to compare by ("day", "month", "year").
   * @returns True if the dates are the same, false otherwise.
   */
  public isSame(
    dateA: Dayjs,
    dateB: Dayjs,
    granularity: "day" | "month" | "year" = "day",
  ): boolean {
    return dateA.isSame(dateB, granularity);
  }

  /**
   * Gets the start of a specified time period for a Day.js date object.
   * @param date - The Day.js date object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @param locale - The locale to use.
   * @returns The Day.js date object representing the start of the period.
   */
  public startOf(
    date: Dayjs,
    offset: "day" | "week" | "month" | "year",
    locale?: string,
  ): Dayjs {
    return date.locale(locale ?? this.locale).startOf(offset);
  }

  /**
   * Gets the end of a specified time period for a Day.js date object.
   * @param date - The Day.js date object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @param locale - The locale to use.
   * @returns The Day.js date object representing the end of the period.
   */
  public endOf(
    date: Dayjs,
    offset: "day" | "week" | "month" | "year",
    locale?: string,
  ): Dayjs {
    return date.locale(locale ?? this.locale).endOf(offset);
  }

  /**
   * Gets the current date with the time set to the start of the day.
   * @param locale - The locale to use.
   * @returns The current date at the start of the day.
   */
  public today(locale?: string): Dayjs {
    return this.dayjs()
      .locale(locale ?? this.locale)
      .startOf("day");
  }

  /**
   * Gets the current date and time.
   * @param locale - The locale to use.
   * @returns The current date and time.
   */
  public now(locale?: string): Dayjs {
    return this.dayjs().locale(locale ?? this.locale);
  }

  /**
   * Gets the day of the week for a Day.js date object.
   * @param date - The Day.js date object.
   * @param locale - The locale to use.
   * @returns The day of the week as a number (0-6).
   */
  public getDayOfWeek(date: Dayjs, locale?: string): number {
    return date.locale(locale ?? this.locale).day();
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
    const day = this.dayjs().weekday(dow);
    return format === "narrow" ? day.format("dd")[0] : day.format("dddd");
  }

  /**
   * Gets the day of the month for a Day.js date object.
   * @param date - The Day.js date object.
   * @returns The day of the month as a number (1-31).
   */
  public getDay(date: Dayjs): number {
    return date.date();
  }

  /**
   * Gets the month for a Day.js date object.
   * @param date - The Day.js date object.
   * @returns The month as a number (0-11).
   */
  public getMonth(date: Dayjs): number {
    return date.month();
  }

  /**
   * Gets the year for a Day.js date object.
   * @param date - The Day.js date object.
   * @returns The year as a number.
   */
  public getYear(date: Dayjs): number {
    return date.year();
  }

  /**
   * Gets the time components for a Day.js date object.
   * @param date - The Day.js date object.
   * @returns An object containing the hour, minute, second, and millisecond.
   */
  public getTime(date: Dayjs): TimeFields | null {
    return {
      hour: date.get("hour"),
      minute: date.get("minute"),
      second: date.get("second"),
      millisecond: date.get("millisecond"),
    };
  }
}
