import defaultMoment, { type Moment } from "moment";
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
  export interface DateFrameworkTypeMap {
    moment: Moment;
  }
}

/**
 * Adapter for Moment.js library, implementing the SaltDateAdapter interface.
 * Provides methods for date manipulation and formatting using Moment.js.
 *
 * @deprecated Moment date library has been deprecated by its maintainers since September 2020, consider migration to a maintained OSS library.
 */
export class AdapterMoment implements SaltDateAdapter<Moment, string> {
  /**
   * The Moment.js instance used for date operations.
   */
  public moment: typeof defaultMoment;

  /**
   * The locale used for date formatting.
   */
  public locale: string;

  /**
   * The name of the date library.
   */
  public lib = "moment";

  /**
   * Creates an instance of AdapterMoment.
   * @param options - Adapter options including locale and instance.
   */
  constructor({
    locale,
    instance,
  }: AdapterOptions<string, typeof defaultMoment> = {}) {
    this.moment = instance || defaultMoment;
    this.locale = locale || "en";
  }

  /**
   * Checks if the timezone plugin is available.
   * @returns True if the timezone plugin is available, false otherwise.
   */
  private hasTimezonePlugin = () =>
    typeof (this.moment as any).tz !== "undefined";

  /**
   * Creates a Moment.js date object in the system timezone.
   * @param value - The date string to parse.
   * @param locale - The locale to use for parsing.
   * @returns The parsed Moment.js date object.
   */
  private createSystemDate = (
    value: string | undefined,
    locale?: string,
  ): Moment => {
    const parsedValue = this.moment(value).local();
    if (this.locale === undefined && locale === undefined) {
      return parsedValue;
    }

    return parsedValue.locale(locale ?? this.locale);
  };

  /**
   * Creates a Moment.js date object in UTC.
   * @param value - The date string to parse.
   * @param locale - The locale to use for parsing.
   * @returns The parsed Moment.js date object.
   */
  private createUTCDate = (
    value: string | undefined,
    locale?: string,
  ): Moment => {
    const parsedValue = this.moment.utc(value);
    if (this.locale === undefined && locale === undefined) {
      return parsedValue;
    }

    return parsedValue.locale(locale ?? this.locale);
  };

  /**
   * Creates a Moment.js date object in a specified timezone.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use.
   * @param locale - The locale to use for parsing.
   * @returns The parsed Moment.js date object.
   * @throws Error if the timezone plugin is missing.
   */
  private createTZDate = (
    value: string | undefined,
    timezone: Timezone,
    locale?: string,
  ): Moment => {
    if (!this.hasTimezonePlugin()) {
      throw new Error("Salt moment adapter: missing timezone plugin");
    }
    const parsedValue =
      timezone === "default"
        ? this.moment(value)
        : (this.moment as any).tz(value, timezone);

    if (this.locale === undefined && locale === undefined) {
      return parsedValue;
    }
    return parsedValue.locale(locale ?? this.locale);
  };

  /**
   * Creates a Moment.js date object from a string or returns the current date.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use (default is "default").
   * @param locale - The locale to use for parsing.
   * @returns The parsed Moment.js date object or null.
   */
  public date = <T extends string | null | undefined>(
    value?: T,
    timezone: Timezone = "default",
    locale?: string,
  ): DateBuilderReturnType<T, Moment> => {
    type R = DateBuilderReturnType<T, Moment>;
    if (value === null) {
      return <R>null;
    }

    if (timezone === "UTC") {
      return <R>this.createUTCDate(value, locale);
    }

    if (
      timezone === "system" ||
      (timezone === "default" && !this.hasTimezonePlugin())
    ) {
      return <R>this.createSystemDate(value, locale);
    }

    return <R>this.createTZDate(value, timezone, locale);
  };

  /**
   * Formats a Moment.js date object using the specified format string.
   * @param date - The Moment.js date object to format.
   * @param format - The format string to use.
   * @param locale - The locale to use for formatting.
   * @returns The formatted date string.
   */
  public format(
    date: Moment,
    format: RecommendedFormats = "DD MMM YYYY",
    locale?: string,
  ): string {
    return date
      .clone()
      .locale(locale ?? this.locale)
      .format(format);
  }

  /**
   * Compares two Moment.js date objects.
   * @param dateA - The first Moment.js date object.
   * @param dateB - The second Moment.js date object.
   * @returns 0 if equal, 1 if dateA is after dateB, -1 if dateA is before dateB.
   */
  public compare(dateA: Moment, dateB: Moment): number {
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
  ): DateDetail<Moment> {
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

    const newDate =
      this.locale || locale
        ? this.moment(value, format, locale ?? this.locale, true)
        : this.moment(value, format, true);
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
   * Checks if a Moment.js date object is valid.
   * @param date - The Moment.js date object to check.
   * @returns True if the date is valid, false otherwise.
   */
  public isValid(date: Moment | null | undefined): boolean {
    return date ? date.isValid() : false;
  }

  /**
   * Subtracts time from a Moment.js date object.
   * @param date - The Moment.js date object to subtract from.
   * @param duration - The duration to subtract.
   * @returns The resulting Moment.js date object.
   */
  public subtract(
    date: Moment,
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
  ): Moment {
    const newDate = date.clone();
    if (days) {
      newDate.subtract(days, "days");
    }
    if (weeks) {
      newDate.subtract(weeks, "weeks");
    }
    if (months) {
      newDate.subtract(months, "months");
    }
    if (years) {
      newDate.subtract(years, "years");
    }
    if (hours) {
      newDate.subtract(hours, "hours");
    }
    if (minutes) {
      newDate.subtract(minutes, "minutes");
    }
    if (seconds) {
      newDate.subtract(seconds, "seconds");
    }
    if (milliseconds) {
      newDate.subtract(milliseconds, "milliseconds");
    }
    return newDate;
  }

  /**
   * Adds time to a Moment.js date object.
   * @param date - The Moment.js date object to add to.
   * @param duration - The duration to add.
   * @returns The resulting Moment.js date object.
   */
  public add(
    date: Moment,
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
  ): Moment {
    const newDate = date.clone();
    if (days) {
      newDate.add(days, "days");
    }
    if (weeks) {
      newDate.add(weeks, "weeks");
    }
    if (months) {
      newDate.add(months, "months");
    }
    if (years) {
      newDate.add(years, "years");
    }
    if (hours) {
      newDate.add(hours, "hour");
    }
    if (minutes) {
      newDate.add(minutes, "minute");
    }
    if (seconds) {
      newDate.add(seconds, "second");
    }
    if (milliseconds) {
      newDate.add(milliseconds, "millisecond");
    }
    return newDate;
  }

  /**
   * Sets specific components of a Moment.js date object.
   * @param date - The Moment.js date object to modify.
   * @param components - The components to set.
   * @returns The resulting Moment.js date object.
   */
  public set(
    date: Moment,
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
  ): Moment {
    const newDate = date.clone();
    if (day) {
      newDate.date(day);
    }
    if (month) {
      newDate.month(month);
    }
    if (year) {
      newDate.year(year);
    }
    if (hour) {
      newDate.hour(hour);
    }
    if (minute) {
      newDate.minute(minute);
    }
    if (second) {
      newDate.second(second);
    }
    if (millisecond) {
      newDate.millisecond(millisecond);
    }
    return newDate;
  }

  /**
   * Checks if two Moment.js date objects are the same based on the specified granularity.
   * @param dateA - The first Moment.js date object.
   * @param dateB - The second Moment.js date object.
   * @param granularity - The granularity to compare by ("day", "month", "year").
   * @returns True if the dates are the same, false otherwise.
   */
  public isSame(
    dateA: Moment,
    dateB: Moment,
    granularity: "day" | "month" | "year" = "day",
  ): boolean {
    return dateA.isSame(dateB, granularity);
  }

  /**
   * Gets the start of a specified time period for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @param locale - The locale to use.
   * @returns The Moment.js date object representing the start of the period.
   */
  public startOf(
    date: Moment,
    offset: "day" | "week" | "month" | "year",
    locale?: string,
  ): Moment {
    const newDate = date.clone().locale(locale ?? this.locale);
    return newDate.startOf(offset);
  }

  /**
   * Gets the end of a specified time period for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @param locale - The locale to use.
   * @returns The Moment.js date object representing the end of the period.
   */
  public endOf(
    date: Moment,
    offset: "day" | "week" | "month" | "year",
    locale?: string,
  ): Moment {
    const newDate = date.clone().locale(locale ?? this.locale);
    return newDate.endOf(offset);
  }

  /**
   * Gets the current date with the time set to the start of the day.
   * @param locale - The locale to use.
   * @returns The current date at the start of the day.
   */
  public today(locale?: string): Moment {
    return this.moment()
      .locale(locale ?? this.locale)
      .startOf("day");
  }

  /**
   * Gets the current date and time.
   * @param locale - The locale to use.
   * @returns The current date and time.
   */
  public now(locale?: string): Moment {
    return this.moment().locale(locale ?? this.locale);
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
    locale?: string,
  ): string {
    const day = this.moment()
      .locale(locale ?? this.locale)
      .weekday(dow);
    return format === "narrow" ? day.format("dd")[0] : day.format("dddd");
  }

  /**
   * Gets the day of the week for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @returns The day of the week as a number (0-6).
   */
  public getDayOfWeek(date: Moment): number {
    return date.day();
  }

  /**
   * Gets the day of the month for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @returns The day of the month as a number (1-31).
   */
  public getDay(date: Moment): number {
    return date.date();
  }

  /**
   * Gets the month for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @returns The month as a number (0-11).
   */
  public getMonth(date: Moment): number {
    return date.month();
  }

  /**
   * Gets the year for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @returns The year as a number.
   */
  public getYear(date: Moment): number {
    return date.year();
  }

  /**
   * Gets the time components for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @returns An object containing the hour, minute, second, and millisecond.
   */
  public getTime(date: Moment): TimeFields | null {
    return {
      hour: date.hour(),
      minute: date.minute(),
      second: date.second(),
      millisecond: date.millisecond(),
    };
  }
}
