import defaultMoment, { type Moment } from "moment-timezone";
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
  export interface DateFrameworkTypeMap {
    moment: Moment;
  }
}

/**
 * Adapter for Moment.js library, implementing the SaltDateAdapter interface.
 * Provides methods for date manipulation and formatting using Moment.js.
 * Salt provides a Moment adapter to aid migration to a maintained library.
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
    // biome-ignore lint/suspicious/noExplicitAny: date framework plugin dependent
    typeof (this.moment as any).tz !== "undefined";

  /**
   * Creates a Moment.js date object in the system timezone.
   * @param value - The date string to parse.
   * @returns The parsed Moment.js date object.
   */
  private createSystemDate = (value: string | undefined): Moment => {
    const parsedValue = this.moment(value).local();
    return this.locale !== undefined
      ? parsedValue.locale(this.locale)
      : parsedValue;
  };

  /**
   * Creates a Moment.js date object in UTC.
   * @param value - The date string to parse.
   * @returns The parsed Moment.js date object.
   */
  private createUTCDate = (value: string): Moment => {
    const parsedValue = this.moment.utc(value);
    return this.locale !== undefined
      ? parsedValue.locale(this.locale)
      : parsedValue;
  };

  /**
   * Creates a Moment.js date object in a specified timezone.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use.
   * @returns The parsed Moment.js date object.
   * @throws Error if the timezone plugin is missing.
   */
  private createTZDate = (value: string, timezone: Timezone): Moment => {
    if (!this.hasTimezonePlugin()) {
      throw new Error("Salt moment adapter: missing timezone plugin");
    }
    const parsedValue =
      timezone === "default"
        ? this.moment(value)
        : // biome-ignore lint/suspicious/noExplicitAny: date framework plugin dependent
          (this.moment as any).tz(value, timezone);

    return this.locale !== undefined
      ? parsedValue.locale(this.locale)
      : parsedValue;
  };

  /**
   * Creates a Moment.js date object from a string or returns an invalid date.
   * @param value - The date string to parse.
   * @param timezone - The timezone to use (default is "default").
   * @returns The parsed Moment.js date object or an invalid date object.
   */
  public date = <T extends string | undefined>(
    value?: T,
    timezone: Timezone = "default",
  ): Moment => {
    if (!value || !this.isValidDateString(value)) {
      return this.moment.invalid();
    }

    if (timezone === "UTC") {
      return this.createUTCDate(value);
    }

    if (
      timezone === "system" ||
      (timezone === "default" && !this.hasTimezonePlugin())
    ) {
      return this.createSystemDate(value);
    }

    return this.createTZDate(value, timezone);
  };

  /**
   * Formats a Moment.js date object using the specified format string.
   * Returns an empty string when null or undefined date is given.
   * @param date - The Moment.js date object to format.
   * @param format - The format string to use.
   * @returns The formatted date string.
   */
  public format(
    date: Moment | null | undefined,
    format: RecommendedFormats = "DD MMM YYYY",
  ): string {
    if (this.isValid(date)) {
      return date.clone().locale(this.locale).format(format);
    }
    return "";
  }

  /**
   * Compares two Moment.js date objects.
   * @param dateA - The first Moment.js date object.
   * @param dateB - The second Moment.js date object.
   * @returns 0 if equal, 1 if dateA is after dateB, -1 if dateA is before dateB.
   */
  public compare(dateA: Moment, dateB: Moment): number {
    const utcDateA = dateA.clone().utc();
    const utcDateB = dateB.clone().utc();

    if (utcDateA.isSame(utcDateB)) {
      return 0;
    }
    if (utcDateA.isBefore(utcDateB)) {
      return -1;
    }
    return 1;
  }

  /**
   * Parses a date string using the specified format.
   * @param value - The date string to parse.
   * @param format - The format string to use.
   * @returns A DateDetail object containing the parsed date and any errors.
   */
  public parse(value: string, format: string): ParserResult<Moment> {
    const parsedDate = this.locale
      ? this.moment(value, format, this.locale, true)
      : this.moment(value, format, true);
    if (parsedDate.isValid()) {
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
   * Checks if a Moment.js date object is valid.
   * @param date - The Moment.js date object to check, null or undefined.
   * @returns True if the date is valid date object, false otherwise.
   */
  public isValid(date: Moment | null | undefined): date is Moment {
    return this.moment.isMoment(date) ? date.isValid() : false;
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
    let newDate = date.clone();
    if (days) {
      newDate = newDate.subtract(days, "days");
    }
    if (weeks) {
      newDate = newDate.subtract(weeks, "weeks");
    }
    if (months) {
      newDate = newDate.subtract(months, "months");
    }
    if (years) {
      newDate = newDate.subtract(years, "years");
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
    let newDate = date.clone();
    if (days) {
      newDate = newDate.add(days, "days");
    }
    if (weeks) {
      newDate = newDate.add(weeks, "weeks");
    }
    if (months) {
      newDate = newDate.add(months, "months");
    }
    if (years) {
      newDate = newDate.add(years, "years");
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
   * Sets specific components of a Moment.js date object.
   * @param date - The Moment.js date object to modify.
   * @param components - The components to set, the month is a number (1-12).
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
    let newDate = date.clone();
    if (day) {
      newDate = newDate.date(day);
    }
    if (month) {
      newDate = newDate.month(month - 1);
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
   * Get the timezone from the Moment object
   * @param date - A Moment object
   * @returns  'UTC' | 'system' or the IANA time zone
   */
  public getTimezone = (date: Moment): string => {
    // @ts-expect-error
    const zone = date._z?.name;
    const defaultZone = date.isUTC() ? "UTC" : "system";
    // @ts-expect-error
    return zone ?? this.moment.defaultZone?.name ?? defaultZone;
  };

  /**
   * Set the timezone for the Moment object
   * @param date - A Moment object
   * @param timezone - Timezone to set date object to
   * @returns  date object set to the timezone
   */
  public setTimezone = (date: Moment, timezone: Timezone): Moment => {
    if (this.getTimezone(date) === timezone) {
      return date;
    }

    if (timezone === "UTC") {
      return date.clone().utc();
    }

    if (timezone === "system") {
      return date.clone().local();
    }

    if (!this.hasTimezonePlugin()) {
      if (timezone !== "default") {
        throw new Error("Salt moment adapter: missing timezone plugin");
      }
      return date;
    }

    const defaultZone =
      timezone === "default"
        ? // @ts-ignore
          (this.moment.defaultZone?.name ?? "system")
        : timezone;

    if (defaultZone === "system") {
      return date.clone().local();
    }

    const newValue = date.clone();
    newValue.tz(defaultZone, true);

    return newValue;
  };

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
   * @returns The Moment.js date object representing the start of the period.
   */
  public startOf(
    date: Moment,
    offset: "day" | "week" | "month" | "year",
  ): Moment {
    const newDate = date.clone().locale(this.locale);
    return newDate.startOf(offset);
  }

  /**
   * Gets the end of a specified time period for a Moment.js date object.
   * @param date - The Moment.js date object.
   * @param offset - The time period ("day", "week", "month", "year").
   * @returns The Moment.js date object representing the end of the period.
   */
  public endOf(
    date: Moment,
    offset: "day" | "week" | "month" | "year",
  ): Moment {
    const newDate = date.clone().locale(this.locale);
    return newDate.endOf(offset);
  }

  /**
   * Gets the current date with the time set to the start of the day.
   * @param timezone - The timezone to use.
   * @returns The current date at the start of the day.
   */
  public today(timezone = "default"): Moment {
    let currentMoment = this.moment();
    if (timezone !== "default" && timezone !== "system") {
      currentMoment = currentMoment.tz(timezone);
    }
    return currentMoment.locale(this.locale).startOf("day");
  }
  /**
   * Gets the current date and time.
   * @param timezone - The timezone to use.
   * @returns The current date and time.
   */
  public now(timezone: Timezone = "default"): Moment {
    let currentMoment = this.moment();
    if (timezone !== "default" && timezone !== "system") {
      currentMoment = currentMoment.tz(timezone);
    }
    return currentMoment.locale(this.locale);
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
    const day = this.moment().locale(this.locale).weekday(dow);
    return format === "narrow" ? day.format("dd")[0] : day.format("dddd");
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
   * @returns The month as a number (1-12).
   */
  public getMonth(date: Moment): number {
    return date.month() + 1;
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
  public getTime(date: Moment): TimeFields {
    return {
      hour: date.hour(),
      minute: date.minute(),
      second: date.second(),
      millisecond: date.millisecond(),
    };
  }

  /**
   * Validate date string so it can be parsed
   * @param value
   */
  public isValidDateString(value: string): boolean {
    /** Ensure ISO 8601 format of date string is passed to Moment to avoid warning **/
    return this.moment(value, this.moment.ISO_8601, true).isValid();
  }

  /**
   * Clone the date object
   * @param date
   */
  public clone(date: Moment): Moment {
    return date.clone();
  }

  public toJSDate = (value: Moment) => {
    return value.toDate();
  };
}
